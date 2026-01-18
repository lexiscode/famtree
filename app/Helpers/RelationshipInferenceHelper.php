<?php

namespace App\Helpers;

/**
 * Helper class for inferring family relationships
 *
 * When a parent creates a child account, this helper determines
 * what relationship the child has with each of the parent's connections.
 */
class RelationshipInferenceHelper
{
    /**
     * Infer the relationship type between a new child and one of the parent's connections
     *
     * @param string $parentRelationshipType The relationship type between parent and their connection (from parent's perspective)
     * @param string|null $childGender The gender of the new child ('male' or 'female')
     * @param string|null $connectionGender The gender of the parent's connection
     * @return string|null The inferred relationship type (from the connection's perspective to the child), or null if no auto-connection should be made
     */
    public static function inferChildRelationship(
        string $parentRelationshipType,
        ?string $childGender,
        ?string $connectionGender = null
    ): ?string {
        // Determine child label based on gender
        $childLabel = self::getChildLabel($childGender);

        // Map parent's relationship to what that person is to the child
        $relationshipMap = [
            // Parent's parents (child's grandparents) -> child is grandchild
            'father' => $childLabel === 'son' ? 'grandson' : 'granddaughter',
            'mother' => $childLabel === 'son' ? 'grandson' : 'granddaughter',

            // Parent's siblings (child's aunts/uncles) -> child is niece/nephew
            'brother' => $childLabel === 'son' ? 'nephew' : 'niece',
            'sister' => $childLabel === 'son' ? 'nephew' : 'niece',

            // Parent's grandparents (child's great-grandparents) -> child is great-grandchild
            'grandfather' => $childLabel === 'son' ? 'great_grandson' : 'great_granddaughter',
            'grandmother' => $childLabel === 'son' ? 'great_grandson' : 'great_granddaughter',

            // Parent's grandchildren -> child is sibling to them (unlikely scenario but handle it)
            'grandson' => $childLabel === 'son' ? 'brother' : 'sister',
            'granddaughter' => $childLabel === 'son' ? 'brother' : 'sister',

            // Parent's spouse/partner -> child is son/daughter (step relationships handled separately)
            'wife' => $childLabel,
            'husband' => $childLabel,

            // Parent's children (child's siblings) -> child is sibling
            'son' => $childLabel === 'son' ? 'brother' : 'sister',
            'daughter' => $childLabel === 'son' ? 'brother' : 'sister',
            'child' => $childLabel === 'son' ? 'brother' : 'sister',

            // Parent's aunts/uncles (child's great-aunts/uncles) -> child is great-niece/great-nephew
            'aunt' => $childLabel === 'son' ? 'great_nephew' : 'great_niece',
            'uncle' => $childLabel === 'son' ? 'great_nephew' : 'great_niece',

            // Parent's nieces/nephews (child's cousins)
            'niece' => 'cousin',
            'nephew' => 'cousin',

            // Parent's cousins (child's cousins once removed) -> child is cousin once removed
            'cousin' => 'cousin_once_removed',

            // Step relationships - skip for now as they're complex
            'step_mother' => null,
            'step_father' => null,
            'step_sibling' => null,
            'step_child' => null,
        ];

        return $relationshipMap[$parentRelationshipType] ?? null;
    }

    /**
     * Get the child label based on gender
     *
     * @param string|null $childGender
     * @return string 'son' or 'daughter'
     */
    private static function getChildLabel(?string $childGender): string
    {
        if ($childGender === 'female') {
            return 'daughter';
        }
        return 'son'; // Default to son if gender is unknown
    }

    /**
     * Get all relationship types that should trigger auto-connection for a new child
     *
     * @return array List of relationship types
     */
    public static function getAutoConnectRelationshipTypes(): array
    {
        return [
            // Direct family - always auto-connect
            'father',
            'mother',
            'brother',
            'sister',
            'sibling',
            'wife',
            'husband',
            'son',
            'daughter',
            'child',
            'niece',
            'nephew',
            // Extended family
            'grandfather',
            'grandmother',
            'grandson',
            'granddaughter',
            'aunt',
            'uncle',
            'cousin',
        ];
    }

    /**
     * Check if a relationship type should trigger auto-connection
     *
     * @param string $relationshipType
     * @return bool
     */
    public static function shouldAutoConnect(string $relationshipType): bool
    {
        return in_array($relationshipType, self::getAutoConnectRelationshipTypes());
    }
}
