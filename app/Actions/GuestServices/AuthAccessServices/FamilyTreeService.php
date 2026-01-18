<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository;
use App\Models\GuestModels\User;

class FamilyTreeService
{
    public function __construct(
        private UserConnectionRepository $connectionRepository,
        private FamilyTreeRepository $familyTreeRepository,
        private FamilyTreeAdminRepository $familyTreeAdminRepository,
        private FamilyTreeValidationService $validationService
    ) {}

    /**
     * Build a hierarchical family tree structure for a user
     */
    public function buildFamilyTree(int $userId): array
    {
        $user = User::findOrFail($userId);
        $allConnections = $this->connectionRepository->getConnections($userId);

        // Build nodes and edges for the family tree
        $nodes = [];
        $edges = [];
        $processedUsers = [];

        // Add the root user (current user)
        $nodes[] = $this->formatUserNode($user, 'root');
        $processedUsers[$userId] = true;

        // Step 1: Process ALL first-level connections first
        // But skip grandchildren - they should be added through their parent (son/daughter)
        $firstLevelUsers = [];
        $grandchildrenToSkip = []; // Track grandchildren to add them later through their parent

        foreach ($allConnections as $connection) {
            $connectedUser = $connection->requester_user_id === $userId
                ? $connection->recipient
                : $connection->requester;

            // Determine relationship from the perspective of the current user
            $relationshipType = $this->getRelationshipFromUserPerspective(
                $connection,
                $userId
            );

            // Skip nephew/niece relationships (only show direct children, not siblings' children)
            // Also skip grandchildren - they should come through their parent
            if (in_array($relationshipType, ['nephew', 'niece'])) {
                // Mark nephew/niece as processed to prevent adding them later in second-level connections
                $processedUsers[$connectedUser->id] = true;
                continue;
            }

            // Skip grandchildren at first level - they will be added through their parent
            if (in_array($relationshipType, ['grandson', 'granddaughter', 'grandchild'])) {
                $grandchildrenToSkip[$connectedUser->id] = [
                    'user' => $connectedUser,
                    'relationshipType' => $relationshipType,
                ];
                continue;
            }

            if (!isset($processedUsers[$connectedUser->id])) {
                $nodes[] = $this->formatUserNode($connectedUser, $relationshipType);
                $processedUsers[$connectedUser->id] = true;
                $firstLevelUsers[] = $connectedUser->id;
            }

            // Create edge (connection line) between users
            $edges[] = [
                'id' => "edge-{$userId}-{$connectedUser->id}",
                'source' => $userId,
                'target' => $connectedUser->id,
                'relationshipType' => $relationshipType,
                'label' => $this->formatRelationshipLabel($relationshipType),
                'color' => $this->getRelationshipColor($relationshipType),
            ];
        }

        // Step 2: Now process second-level connections for each first-level user
        // IMPORTANT: Process sons/daughters FIRST so grandchildren are connected through their parent
        // Sort first level users to process children (son/daughter) before spouse (wife/husband)
        $sortedFirstLevelUsers = [];
        $childConnections = [];
        $otherConnections = [];

        foreach ($allConnections as $connection) {
            $connectedUser = $connection->requester_user_id === $userId
                ? $connection->recipient
                : $connection->requester;

            if (!in_array($connectedUser->id, $firstLevelUsers)) {
                continue;
            }

            $relationshipType = $this->getRelationshipFromUserPerspective($connection, $userId);

            if (in_array($relationshipType, ['son', 'daughter', 'child'])) {
                $childConnections[] = $connectedUser->id;
            } else {
                $otherConnections[] = $connectedUser->id;
            }
        }

        // Process children first, then others
        $sortedFirstLevelUsers = array_merge($childConnections, $otherConnections);

        foreach ($sortedFirstLevelUsers as $connectedUserId) {
            $this->addSecondLevelConnections(
                $connectedUserId,
                $userId,
                $nodes,
                $edges,
                $processedUsers
            );
        }

        return [
            'nodes' => $nodes,
            'edges' => $edges,
            'rootUserId' => $userId,
        ];
    }

    /**
     * Add second level connections (connections of connections)
     */
    private function addSecondLevelConnections(
        int $connectedUserId,
        int $rootUserId,
        array &$nodes,
        array &$edges,
        array &$processedUsers
    ): void {
        // Get the relationship type of the connected user to the root user
        $firstLevelRelationship = null;
        foreach ($this->connectionRepository->getConnections($rootUserId) as $conn) {
            $otherUserId = $conn->requester_user_id === $rootUserId ? $conn->recipient_user_id : $conn->requester_user_id;
            if ($otherUserId === $connectedUserId) {
                $firstLevelRelationship = $this->getRelationshipFromUserPerspective($conn, $rootUserId);
                break;
            }
        }

        $secondLevelConnections = $this->connectionRepository->getConnections($connectedUserId);

        foreach ($secondLevelConnections as $connection) {
            $secondLevelUser = $connection->requester_user_id === $connectedUserId
                ? $connection->recipient
                : $connection->requester;

            // Skip if already processed or if it's the root user
            if (isset($processedUsers[$secondLevelUser->id]) || $secondLevelUser->id === $rootUserId) {
                continue;
            }

            $relationshipType = $this->getRelationshipFromUserPerspective(
                $connection,
                $connectedUserId
            );

            // Skip siblings' children (nephews/nieces) - don't show them in the tree
            if (in_array($firstLevelRelationship, ['brother', 'sister', 'sibling']) &&
                in_array($relationshipType, ['son', 'daughter', 'child', 'nephew', 'niece'])) {
                continue;
            }

            // Skip parents' grandchildren (which are actually siblings' children = nephews/nieces)
            if (in_array($firstLevelRelationship, ['father', 'mother', 'parent']) &&
                in_array($relationshipType, ['grandson', 'granddaughter', 'grandchild'])) {
                continue;
            }

            // Determine the relationship type from ROOT user's perspective for the node label
            // If first level is son/daughter and second level is their child, it's a grandchild to root
            $nodeRelationshipType = $relationshipType;
            if (in_array($firstLevelRelationship, ['son', 'daughter', 'child']) &&
                in_array($relationshipType, ['son', 'daughter', 'child'])) {
                // This is a grandchild - determine gender-specific type
                $nodeRelationshipType = $secondLevelUser->gender === 'male' ? 'grandson' : 'granddaughter';
            }

            $nodes[] = $this->formatUserNode($secondLevelUser, $nodeRelationshipType);
            $processedUsers[$secondLevelUser->id] = true;

            // Create edge between the first level connection and second level user
            // Edge label shows the relationship from first level user's perspective
            $edges[] = [
                'id' => "edge-{$connectedUserId}-{$secondLevelUser->id}",
                'source' => $connectedUserId,
                'target' => $secondLevelUser->id,
                'relationshipType' => $relationshipType,
                'label' => $this->formatRelationshipLabel($relationshipType),
                'color' => $this->getRelationshipColor($relationshipType),
            ];
        }
    }

    /**
     * Format a user as a tree node
     */
    private function formatUserNode(User $user, string $relationshipType): array
    {
        return [
            'id' => $user->id,
            'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
            'username' => $user->username,
            'profileImage' => $user->profile_image_url,
            'status' => $user->status,
            'relationshipType' => $relationshipType,
            'relationshipLabel' => $this->formatRelationshipLabel($relationshipType),
            'nodeColor' => $this->getNodeColor($relationshipType),
        ];
    }

    /**
     * Get relationship type from user's perspective (gender-aware)
     */
    private function getRelationshipFromUserPerspective($connection, int $userId): string
    {
        $requester = $connection->requester;
        $recipient = $connection->recipient;

        if ($connection->requester_user_id === $userId) {
            // User is the requester, so we use the stored relationship as-is
            // But we need to convert it to gender-specific if the recipient's gender is known
            return $this->convertToGenderSpecific(
                $connection->relationship_type,
                $recipient->gender ?? null
            );
        } else {
            // User is the recipient, so we need the inverse relationship
            // And make it gender-specific based on the requester's gender
            $inverseType = $this->getInverseRelationship(
                $connection->relationship_type,
                $requester->gender ?? null,
                $recipient->gender ?? null
            );

            return $this->convertToGenderSpecific(
                $inverseType,
                $requester->gender ?? null
            );
        }
    }

    /**
     * Convert generic relationship types to gender-specific ones
     */
    private function convertToGenderSpecific(string $relationshipType, ?string $gender): string
    {
        if (!$gender) {
            return $relationshipType;
        }

        $genderMap = [
            'sibling' => $gender === 'male' ? 'brother' : 'sister',
            'parent' => $gender === 'male' ? 'father' : 'mother',
            'child' => $gender === 'male' ? 'son' : 'daughter',
            'grandparent' => $gender === 'male' ? 'grandfather' : 'grandmother',
            'grandchild' => $gender === 'male' ? 'grandson' : 'granddaughter',
        ];

        return $genderMap[$relationshipType] ?? $relationshipType;
    }

    /**
     * Get inverse relationship (gender-aware)
     * Based on UserConnectionRepository::getInverseRelationship
     */
    private function getInverseRelationship(string $relationshipType, ?string $requesterGender = null, ?string $recipientGender = null): string
    {
        // For son/daughter relationships, determine parent gender
        if (($relationshipType === 'son' || $relationshipType === 'daughter') && $requesterGender) {
            return $requesterGender === 'male' ? 'father' : 'mother';
        }

        // Handle gender-specific sibling relationships
        if ($relationshipType === 'brother' && $requesterGender === 'male' && $recipientGender === 'male') {
            return 'brother'; // Both male -> same relationship
        }
        if ($relationshipType === 'sister' && $requesterGender === 'female' && $recipientGender === 'female') {
            return 'sister'; // Both female -> same relationship
        }

        // Handle aunt/uncle based on requester's gender
        if (($relationshipType === 'niece' || $relationshipType === 'nephew') && $requesterGender) {
            return $requesterGender === 'male' ? 'uncle' : 'aunt';
        }

        // Handle niece/nephew based on requester's gender (the person we're viewing)
        if (($relationshipType === 'aunt' || $relationshipType === 'uncle') && $requesterGender) {
            return $requesterGender === 'male' ? 'nephew' : 'niece';
        }

        $inverseMap = [
            // Spousal relationships (bidirectional)
            'wife' => 'husband',
            'husband' => 'wife',
            'partner' => 'partner',

            // Parent-child (non-bidirectional)
            'mother' => 'child',
            'father' => 'child',
            'child' => 'parent',
            'son' => 'parent',
            'daughter' => 'parent',

            // Sibling (consider gender for specific mapping)
            'sibling' => 'sibling',
            'brother' => 'sibling', // Will be converted to sister if recipient is female
            'sister' => 'sibling',  // Will be converted to brother if recipient is male

            // Grandparent-grandchild (non-bidirectional)
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandchild' => 'grandparent',
            'grandson' => 'grandparent',
            'granddaughter' => 'grandparent',

            // Extended family (non-bidirectional)
            'aunt' => 'niece', // or nephew depending on gender
            'uncle' => 'nephew', // or niece depending on gender
            'niece' => 'aunt', // or uncle
            'nephew' => 'uncle', // or aunt
            'cousin' => 'cousin',
        ];

        return $inverseMap[$relationshipType] ?? $relationshipType;
    }

    /**
     * Format relationship label for display
     */
    private function formatRelationshipLabel(string $relationshipType): string
    {
        // Handle special cases for better labeling
        $labelMap = [
            'sibling' => 'Sibling',
            'parent' => 'Parent',
            'child' => 'Child',
            'grandparent' => 'Grandparent',
            'grandchild' => 'Grandchild',
        ];

        if (isset($labelMap[$relationshipType])) {
            return $labelMap[$relationshipType];
        }

        return ucfirst(str_replace('_', ' ', $relationshipType));
    }

    /**
     * Get color for relationship type (for edge styling)
     */
    private function getRelationshipColor(string $relationshipType): string
    {
        $colorMap = [
            'father' => '#3B82F6',      // Blue
            'mother' => '#EC4899',      // Pink
            'son' => '#10B981',         // Green
            'daughter' => '#F59E0B',    // Amber
            'brother' => '#8B5CF6',     // Purple
            'sister' => '#EF4444',      // Red
            'husband' => '#06B6D4',     // Cyan
            'wife' => '#F472B6',        // Pink
            'grandfather' => '#6366F1', // Indigo
            'grandmother' => '#A855F7', // Purple
            'grandson' => '#14B8A6',    // Teal
            'granddaughter' => '#FB923C', // Orange
            'uncle' => '#84CC16',       // Lime
            'aunt' => '#F97316',        // Orange
            'nephew' => '#0EA5E9',      // Sky
            'niece' => '#DB2777',       // Pink
            'cousin' => '#64748B',      // Slate
            'parent' => '#6366F1',      // Indigo
            'child' => '#10B981',       // Green
            'sibling' => '#8B5CF6',     // Purple
            'grandparent' => '#7C3AED', // Violet
            'grandchild' => '#059669',  // Emerald
            'uncle_aunt' => '#F59E0B',  // Amber
            'nephew_niece' => '#0891B2', // Cyan
            'root' => '#667eea',        // Purple gradient start
        ];

        return $colorMap[$relationshipType] ?? '#64748B'; // Default gray
    }

    /**
     * Get node color based on relationship type
     */
    private function getNodeColor(string $relationshipType): string
    {
        if ($relationshipType === 'root') {
            return '#667eea'; // Special color for root user
        }

        $colorMap = [
            'father' => '#DBEAFE',      // Light blue
            'mother' => '#FCE7F3',      // Light pink
            'son' => '#D1FAE5',         // Light green
            'daughter' => '#FEF3C7',    // Light amber
            'brother' => '#EDE9FE',     // Light purple
            'sister' => '#FEE2E2',      // Light red
            'husband' => '#CFFAFE',     // Light cyan
            'wife' => '#FCE7F3',        // Light pink
            'parent' => '#E0E7FF',      // Light indigo
            'child' => '#D1FAE5',       // Light green
            'sibling' => '#EDE9FE',     // Light purple
            'grandparent' => '#DDD6FE', // Light violet
            'grandchild' => '#D1FAE5',  // Light emerald
        ];

        return $colorMap[$relationshipType] ?? '#F1F5F9'; // Default light gray
    }

    /**
     * Create a new nuclear family tree
     *
     * @param User $user
     * @param array $treeData ['tree_name', 'description', 'is_public']
     * @return array ['success' => bool, 'tree' => FamilyTree|null, 'members_added' => int, 'errors' => array]
     */
    public function createNuclearFamilyTree(User $user, array $treeData): array
    {
        // Validate user can create tree
        $validation = $this->validationService->canCreateFamilyTree($user);

        if (!$validation['can_create']) {
            return [
                'success' => false,
                'tree' => null,
                'members_added' => 0,
                'errors' => $validation['errors'],
            ];
        }

        try {
            // Create the family tree
            $tree = $this->familyTreeRepository->create([
                'root_user_id' => $user->id,
                'tree_name' => $treeData['tree_name'],
                'description' => $treeData['description'] ?? null,
                'is_public' => $treeData['is_public'] ?? false,
                'created_by_user_id' => $user->id,
                'is_nuclear_family' => true,
            ]);

            // Add creator as admin
            $this->familyTreeAdminRepository->create(
                familyTreeId: $tree->id,
                userId: $user->id,
                role: 'creator',
                grantedByUserId: null
            );

            // Add creator as member with full permissions
            $this->familyTreeRepository->addMemberWithRole(
                treeId: $tree->id,
                userId: $user->id,
                addedByUserId: $user->id,
                nuclearFamilyRole: null,
                canAddMembers: true
            );

            // Auto-add nuclear family members (spouse + children)
            $nuclearFamilyMembers = $this->validationService->getNuclearFamilyMemberIds($user->id);
            $membersAdded = 0;

            foreach ($nuclearFamilyMembers as $member) {
                $this->familyTreeRepository->addMemberWithRole(
                    treeId: $tree->id,
                    userId: $member['user_id'],
                    addedByUserId: $user->id,
                    nuclearFamilyRole: $member['role'],
                    canAddMembers: true
                );
                $membersAdded++;
            }

            return [
                'success' => true,
                'tree' => $tree->fresh('admins.user', 'members.user'),
                'members_added' => $membersAdded,
                'errors' => [],
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'tree' => null,
                'members_added' => 0,
                'errors' => ['Failed to create family tree: ' . $e->getMessage()],
            ];
        }
    }

    /**
     * Check if a user can add members to a tree
     *
     * @param int $treeId
     * @param int $userId
     * @return bool
     */
    public function canAddMembers(int $treeId, int $userId): bool
    {
        // Admins can always add members
        if ($this->familyTreeAdminRepository->isAdmin($treeId, $userId)) {
            return true;
        }

        // Nuclear family members with can_add_members permission can add
        $memberEntry = $this->familyTreeRepository->getMemberEntry($treeId, $userId);
        if ($memberEntry && $memberEntry->canAddMembers()) {
            return true;
        }

        return false;
    }

    /**
     * Add a nuclear family member to a tree
     *
     * @param int $treeId
     * @param int $memberUserId
     * @param int $addedByUserId
     * @return array ['success' => bool, 'message' => string, 'error' => string|null]
     */
    public function addNuclearFamilyMember(int $treeId, int $memberUserId, int $addedByUserId): array
    {
        // Verify adder has permission
        if (!$this->canAddMembers($treeId, $addedByUserId)) {
            return [
                'success' => false,
                'message' => null,
                'error' => 'You do not have permission to add members to this family tree.',
            ];
        }

        // Check if member is already in the tree
        if ($this->familyTreeRepository->isMember($treeId, $memberUserId)) {
            return [
                'success' => false,
                'message' => null,
                'error' => 'This user is already a member of the family tree.',
            ];
        }

        // Verify user being added is nuclear family of adder
        $nuclearFamilyMembers = $this->validationService->getNuclearFamilyMemberIds($addedByUserId);
        $memberIds = array_column($nuclearFamilyMembers, 'user_id');

        if (!in_array($memberUserId, $memberIds)) {
            return [
                'success' => false,
                'message' => null,
                'error' => 'You can only add your nuclear family members (spouse or children) to the family tree.',
            ];
        }

        // Find the role for this member
        $role = null;
        foreach ($nuclearFamilyMembers as $member) {
            if ($member['user_id'] === $memberUserId) {
                $role = $member['role'];
                break;
            }
        }

        // Add the member with proper role and permissions
        try {
            $this->familyTreeRepository->addMemberWithRole(
                treeId: $treeId,
                userId: $memberUserId,
                addedByUserId: $addedByUserId,
                nuclearFamilyRole: $role,
                canAddMembers: true
            );

            $memberUser = User::find($memberUserId);
            $memberName = $memberUser ? trim($memberUser->first_name . ' ' . $memberUser->last_name) : 'Member';

            return [
                'success' => true,
                'message' => "{$memberName} has been added to the family tree.",
                'error' => null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => null,
                'error' => 'Failed to add member: ' . $e->getMessage(),
            ];
        }
    }
}
