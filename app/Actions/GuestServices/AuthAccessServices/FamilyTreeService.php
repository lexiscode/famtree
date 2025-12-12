<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;

class FamilyTreeService
{
    public function __construct(
        private UserConnectionRepository $connectionRepository
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

        // Process all connections
        foreach ($allConnections as $connection) {
            $connectedUser = $connection->requester_user_id === $userId
                ? $connection->recipient
                : $connection->requester;

            // Determine relationship from the perspective of the current user
            $relationshipType = $this->getRelationshipFromUserPerspective(
                $connection,
                $userId
            );

            if (!isset($processedUsers[$connectedUser->id])) {
                $nodes[] = $this->formatUserNode($connectedUser, $relationshipType);
                $processedUsers[$connectedUser->id] = true;
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

            // Recursively add connections of connected users (up to 2 levels deep)
            $this->addSecondLevelConnections(
                $connectedUser->id,
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

            $nodes[] = $this->formatUserNode($secondLevelUser, $relationshipType);
            $processedUsers[$secondLevelUser->id] = true;

            // Create edge between the first level connection and second level user
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

        // Handle niece/nephew based on recipient's gender
        if (($relationshipType === 'aunt' || $relationshipType === 'uncle') && $recipientGender) {
            return $recipientGender === 'male' ? 'nephew' : 'niece';
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
}
