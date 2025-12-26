<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\AuthAccessRepositories\SuggestedConnectionRepository;

class RelationshipInferenceService
{
    public function __construct(
        private SuggestedConnectionRepository $suggestionRepository
    ) {
    }

    /**
     * Infer the relationship type between two users based on connection chains
     * Returns an array with 'type' and 'label' keys
     */
    public function inferRelationship(int $userId, int $targetUserId): ?array
    {
        // Get the connection path between the two users
        $path = $this->suggestionRepository->getConnectionPath($userId, $targetUserId);

        if (!$path) {
            return null;
        }

        // For a direct connection, return the actual relationship
        if ($path['length'] === 1) {
            $connection = $path['path'][0];
            $isRequester = $connection->requester_user_id === $userId;

            if ($isRequester) {
                $type = $connection->relationship_type;
            } else {
                // Get the inverse relationship
                $type = $this->getInverseRelationship($connection->relationship_type, $connection->requester?->gender);
            }

            return [
                'type' => $type,
                'label' => $this->getRelationshipLabel($type),
                'confidence' => 100,
                'path_length' => 1,
            ];
        }

        // For second-degree connections, infer the relationship
        if ($path['length'] === 2) {
            $firstConnection = $path['path'][0];
            $secondConnection = $path['path'][1];
            $intermediateUserId = $path['intermediate_user_id'];

            // Get the relationship types in the chain
            $firstType = $this->getRelationshipFromUserPerspective($userId, $intermediateUserId, $firstConnection);
            $secondType = $this->getRelationshipFromUserPerspective($intermediateUserId, $targetUserId, $secondConnection);

            // Get genders for context-aware inference
            $targetUser = User::find($targetUserId);
            $intermediateUser = User::find($intermediateUserId);

            // Infer the combined relationship
            $inferredType = $this->inferCombinedRelationship(
                $firstType,
                $secondType,
                $intermediateUser?->gender,
                $targetUser?->gender
            );

            return [
                'type' => $inferredType['type'],
                'label' => $inferredType['label'],
                'confidence' => $inferredType['confidence'],
                'path_length' => 2,
                'reasoning' => $inferredType['reasoning'] ?? null,
            ];
        }

        return null;
    }

    /**
     * Get the relationship type from a user's perspective in a connection
     */
    private function getRelationshipFromUserPerspective(int $userId, int $otherUserId, UserConnection $connection): string
    {
        if ($connection->requester_user_id === $userId) {
            return $connection->relationship_type;
        } else {
            return $this->getInverseRelationship($connection->relationship_type, $connection->requester?->gender);
        }
    }

    /**
     * Infer the combined relationship from a chain of two relationships
     * Example: Brother + Sister = Sister
     */
    private function inferCombinedRelationship(
        string $firstRelationType,
        string $secondRelationType,
        ?string $intermediateUserGender,
        ?string $targetUserGender
    ): array {
        // Get the inference map
        $inferenceMap = $this->getInferenceMap();

        // Create a key from the two relationship types
        $key = $firstRelationType . '_' . $secondRelationType;

        if (isset($inferenceMap[$key])) {
            $result = $inferenceMap[$key];

            // Handle gender-specific outcomes
            if (is_array($result)) {
                $inferred = $result;
            } else {
                $inferred = ['type' => $result, 'confidence' => 85];
            }
        } else {
            // Fallback: default to the second relationship type if no specific rule
            $inferred = [
                'type' => $secondRelationType,
                'confidence' => 60,
            ];
        }

        // Add label
        $inferred['label'] = $this->getRelationshipLabel($inferred['type']);

        // Add reasoning if not already present
        if (!isset($inferred['reasoning'])) {
            $inferred['reasoning'] = null;
        }

        return $inferred;
    }

    /**
     * Get the inference map for relationship combinations
     * Maps combinations like "brother_sister" to inferred relationship "sister"
     */
    private function getInferenceMap(): array
    {
        return [
            // Sibling relationships
            'brother_brother' => 'brother',
            'brother_sister' => 'sister',
            'sister_brother' => 'brother',
            'sister_sister' => 'sister',
            'sibling_sibling' => 'sibling',

            // Brother/Sister with parent
            'brother_mother' => 'mother',
            'brother_father' => 'father',
            'sister_mother' => 'mother',
            'sister_father' => 'father',

            // Children viewing their other parent (spousal inference)
            'son_mother' => 'wife',
            'son_father' => 'husband',
            'daughter_mother' => 'wife',
            'daughter_father' => 'husband',

            // Parent with child through siblings (parent viewing their children)
            'son_brother' => 'son',
            'son_sister' => 'daughter',
            'daughter_brother' => 'son',
            'daughter_sister' => 'daughter',
            'son_son' => 'son',
            'son_daughter' => 'daughter',
            'daughter_son' => 'son',
            'daughter_daughter' => 'daughter',

            // Parent's children viewing their aunts/uncles children (parent → child → child)
            'mother_son' => 'uncle',
            'mother_daughter' => 'aunt',
            'father_son' => 'uncle',
            'father_daughter' => 'aunt',

            // Sibling with child (nephew/niece relationships)
            'brother_son' => 'nephew',
            'brother_daughter' => 'niece',
            'sister_son' => 'nephew',
            'sister_daughter' => 'niece',

            // Sibling with nephew/niece
            'brother_nephew' => 'cousin',
            'brother_niece' => 'cousin',
            'sister_nephew' => 'cousin',
            'sister_niece' => 'cousin',

            // Cousin relationships
            'brother_cousin' => 'cousin',
            'sister_cousin' => 'cousin',
            'cousin_cousin' => 'cousin',

            // Grandparent relationships
            'mother_mother' => 'grandmother',
            'mother_father' => 'grandfather',
            'father_mother' => 'grandmother',
            'father_father' => 'grandfather',
            'mother_child' => 'grandmother',
            'father_child' => 'grandfather',

            // Extended relationships
            'sibling_child' => ['type' => 'nephew', 'confidence' => 85], // or niece
            'sibling_mother' => 'mother',
            'sibling_father' => 'father',

            // Child viewing siblings (parent's perspective - child_brother = son, child_sister = daughter)
            'child_brother' => 'son',
            'child_sister' => 'daughter',
            'child_son' => 'son',
            'child_daughter' => 'daughter',

            // Child viewing parent (spousal inference)
            'child_mother' => 'wife',
            'child_father' => 'husband',

            // Default fallbacks
            'child_child' => 'cousin',
            'son_child' => 'nephew',
            'daughter_child' => 'niece',
        ];
    }

    /**
     * Get the inverse relationship type
     */
    private function getInverseRelationship(string $relationshipType, ?string $requesterGender = null): string
    {
        $inverseMap = [
            // Sibling relationships
            'brother' => 'brother',
            'sister' => 'sister',
            'sibling' => 'sibling',

            // Parent-child
            'mother' => 'child',
            'father' => 'child',
            'child' => 'mother',
            'son' => 'father',
            'daughter' => 'mother',

            // Grandparent
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandson' => 'grandfather',
            'granddaughter' => 'grandmother',
            'grandchild' => 'grandmother',

            // Extended family
            'aunt' => 'niece',
            'uncle' => 'nephew',
            'niece' => 'aunt',
            'nephew' => 'uncle',
            'cousin' => 'cousin',

            // Spousal
            'wife' => 'husband',
            'husband' => 'wife',
            'partner' => 'partner',

            // Default
        ];

        return $inverseMap[$relationshipType] ?? $relationshipType;
    }

    /**
     * Get a human-readable label for a relationship type
     * Returns "This person seems to be your {relationship}"
     */
    public function getRelationshipLabel(string $relationshipType): string
    {
        $labels = [
            'mother' => 'Mother',
            'father' => 'Father',
            'son' => 'Son',
            'daughter' => 'Daughter',
            'brother' => 'Brother',
            'sister' => 'Sister',
            'grandmother' => 'Grandmother',
            'grandfather' => 'Grandfather',
            'grandson' => 'Grandson',
            'granddaughter' => 'Granddaughter',
            'aunt' => 'Aunt',
            'uncle' => 'Uncle',
            'niece' => 'Niece',
            'nephew' => 'Nephew',
            'cousin' => 'Cousin',
            'child' => 'Child',
            'sibling' => 'Sibling',
            'grandchild' => 'Grandchild',
            'wife' => 'Wife',
            'husband' => 'Husband',
            'partner' => 'Partner',
            'step_mother' => 'Step-mother',
            'step_father' => 'Step-father',
            'step_sibling' => 'Step-sibling',
            'step_child' => 'Step-child',
            'mother_in_law' => 'Mother-in-law',
            'father_in_law' => 'Father-in-law',
            'sister_in_law' => 'Sister-in-law',
            'brother_in_law' => 'Brother-in-law',
            'godparent' => 'Godparent',
            'godchild' => 'Godchild',
        ];

        return $labels[$relationshipType] ?? ucfirst(str_replace('_', ' ', $relationshipType));
    }

    /**
     * Get human-readable inference text
     * Example: "This person seems to be your sister"
     */
    public function getInferenceText(string $relationshipLabel): string
    {
        return "This person seems to be your " . strtolower($relationshipLabel);
    }
}
