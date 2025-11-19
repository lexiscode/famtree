<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\FamilyTree;
use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Database\Eloquent\Collection;

class FamilyTreeService
{
    public function __construct(
        private FamilyTreeRepository $treeRepository,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Build a family tree structure from a user's connections
     * This creates a hierarchical tree with parents at top, children at bottom
     *
     * @param int $userId
     * @return array
     */
    public function buildTreeData(int $userId): array
    {
        $user = User::findOrFail($userId);

        // Get all connections for this user
        $connections = $this->connectionRepository->getConnections($userId);

        // Organize connections by relationship type
        $tree = [
            'root' => $this->formatUserNode($user),
            'parents' => [],
            'siblings' => [],
            'children' => [],
            'grandparents' => [],
            'grandchildren' => [],
            'extended' => [],
        ];

        // Build connection map for relationship lookups
        $connectionMap = [];
        foreach ($connections as $connection) {
            $relType = $connection->relationship_type;
            if (!isset($connectionMap[$relType])) {
                $connectionMap[$relType] = [];
            }
            $connectionMap[$relType][] = $connection;
        }

        // Organize users by relationship
        foreach ($connectionMap as $relationshipType => $users) {
            $organized = $this->organizeByRelationship($relationshipType, $users);
            foreach ($organized as $relation => $items) {
                if (isset($tree[$relation])) {
                    $tree[$relation] = array_merge($tree[$relation], $items);
                }
            }
        }

        return $tree;
    }

    /**
     * Organize users by relationship type into categories
     */
    private function organizeByRelationship(string $relationshipType, array $users): array
    {
        $organized = [];

        switch ($relationshipType) {
            case 'father':
            case 'mother':
                $organized['parents'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;

            case 'son':
            case 'daughter':
                $organized['children'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;

            case 'brother':
            case 'sister':
            case 'sibling':
                $organized['siblings'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;

            case 'grandfather':
            case 'grandmother':
                $organized['grandparents'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;

            case 'grandson':
            case 'granddaughter':
                $organized['grandchildren'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;

            default:
                $organized['extended'] = array_map(fn($u) => $this->formatUserNode($u->recipient_user_id ?? $u->requester_user_id), $users);
                break;
        }

        return $organized;
    }

    /**
     * Format a user ID or User model into a node for visualization
     */
    private function formatUserNode($userOrId): array
    {
        $user = is_int($userOrId) ? User::find($userOrId) : $userOrId;

        if (!$user) {
            return [];
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
        ];
    }

    /**
     * Get formatted tree visualization data for frontend
     * Includes hierarchy positioning for visual layout
     */
    public function getTreeVisualization(int $treeId): array
    {
        $tree = $this->treeRepository->getTree($treeId);
        $members = $this->treeRepository->getTreeMembers($treeId);

        $treeData = [
            'tree' => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'root_user_id' => $tree->root_user_id,
                'created_by_user_id' => $tree->created_by_user_id,
                'created_at' => $tree->created_at,
                'updated_at' => $tree->updated_at,
            ],
            'members' => [],
            'connections' => [],
        ];

        // Format all members
        foreach ($members as $member) {
            $treeData['members'][] = [
                'id' => $member->user_id,
                'name' => $member->user->first_name . ' ' . $member->user->last_name,
                'username' => $member->user->username,
                'profile_image_url' => $member->user->profile_image_url,
                'status' => $member->user->status,
                'added_at' => $member->added_at,
                'added_by' => [
                    'id' => $member->addedBy->id,
                    'name' => $member->addedBy->first_name . ' ' . $member->addedBy->last_name,
                ],
            ];
        }

        // Build connection relationships between tree members
        $memberIds = collect($members)->pluck('user_id')->toArray();
        foreach ($memberIds as $userId1) {
            foreach ($memberIds as $userId2) {
                if ($userId1 !== $userId2) {
                    $connectionTypes = $this->connectionRepository->getConnectionType($userId1, $userId2);
                    if ($connectionTypes) {
                        $treeData['connections'][] = [
                            'from' => $userId1,
                            'to' => $userId2,
                            'relationship' => $connectionTypes[0] ?? 'related',
                        ];
                    }
                }
            }
        }

        return $treeData;
    }

    /**
     * Create a family tree from user's connections
     */
    public function createFromConnections(int $userId, string $treeName, string $description = null, bool $isPublic = false): FamilyTree
    {
        return $this->treeRepository->create([
            'root_user_id' => $userId,
            'tree_name' => $treeName,
            'description' => $description,
            'is_public' => $isPublic,
            'created_by_user_id' => $userId,
        ]);
    }

    /**
     * Add a user's connections to a tree
     */
    public function addUserConnections(int $treeId, int $userId): int
    {
        $connections = $this->connectionRepository->getConnections($userId);
        $addedCount = 0;

        foreach ($connections as $connection) {
            $connectedUserId = $connection->recipient_user_id === $userId
                ? $connection->requester_user_id
                : $connection->recipient_user_id;

            if (!$this->treeRepository->isMember($treeId, $connectedUserId)) {
                $this->treeRepository->addMember($treeId, $connectedUserId, $userId);
                $addedCount++;
            }
        }

        return $addedCount;
    }

    /**
     * Get tree hierarchy level for a user in the tree
     * Used for visual positioning
     *
     * @return string (ancestors, root, descendants, extended)
     */
    public function getHierarchyLevel(int $userId, int $rootUserId): string
    {
        if ($userId === $rootUserId) {
            return 'root';
        }

        $connectionTypes = $this->connectionRepository->getConnectionType($userId, $rootUserId);

        if (!$connectionTypes) {
            return 'extended';
        }

        $relType = $connectionTypes[0] ?? '';

        // Ancestors
        if (in_array($relType, ['father', 'mother', 'grandfather', 'grandmother'])) {
            return 'ancestors';
        }

        // Descendants
        if (in_array($relType, ['son', 'daughter', 'grandson', 'granddaughter'])) {
            return 'descendants';
        }

        // Siblings and extended
        return 'extended';
    }

    /**
     * Get statistics about a family tree
     */
    public function getTreeStats(int $treeId): array
    {
        $tree = $this->treeRepository->getTree($treeId);
        $memberCount = $this->treeRepository->getMemberCount($treeId);

        return [
            'tree_id' => $tree->id,
            'member_count' => $memberCount,
            'tree_name' => $tree->tree_name,
            'is_public' => $tree->is_public,
            'created_at' => $tree->created_at,
            'created_by' => $tree->createdBy ? [
                'id' => $tree->createdBy->id,
                'name' => $tree->createdBy->name,
            ] : [
                'id' => null,
                'name' => 'Unknown User',
            ],
        ];
    }

    /**
     * Validate tree ownership
     */
    public function isOwner(int $treeId, int $userId): bool
    {
        return $this->treeRepository->isOwner($treeId, $userId);
    }
}
