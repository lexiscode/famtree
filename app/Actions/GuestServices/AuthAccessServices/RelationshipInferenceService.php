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

            // If either hop has an "ex_" prefixed type, the chain goes through a dissolved
            // relationship — the target has no familial tie to the logged-in user.
            if (str_starts_with($firstType, 'ex_') || str_starts_with($secondType, 'ex_')) {
                return null;
            }

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

            // Divorce-aware handling: if either connection is divorced, the chain
            // goes through a dissolved marriage — exclude entirely.
            if ($firstConnection->isDivorced() || $secondConnection->isDivorced()) {
                return null;
            }

            // Step-child detection: spouse's children from a different parent
            $childTypes = ['son', 'daughter', 'child'];
            $spouseTypes = ['wife', 'husband', 'partner'];
            $parentTypes = ['father', 'mother', 'parent'];
            if (in_array($inferredType['type'], $childTypes) && in_array($firstType, $spouseTypes)) {
                if ($secondConnection->other_parent_id && $secondConnection->other_parent_id !== $userId) {
                    $stepType = match ($inferredType['type']) {
                        'daughter' => 'step_daughter',
                        'child' => 'step_child',
                        default => 'step_son',
                    };
                    $inferredType['type'] = $stepType;
                    $inferredType['label'] = $this->getRelationshipLabel($stepType);
                }
            }

            // Step-parent detection: parent's spouse who isn't the user's other parent
            if (in_array($inferredType['type'], $parentTypes) && in_array($firstType, $parentTypes)) {
                if ($firstConnection->other_parent_id && $firstConnection->other_parent_id !== $targetUserId) {
                    $stepType = match ($inferredType['type']) {
                        'mother' => 'step_mother',
                        'father' => 'step_father',
                        default => 'step_father',
                    };
                    $inferredType['type'] = $stepType;
                    $inferredType['label'] = $this->getRelationshipLabel($stepType);
                }
            }

            // Step-sibling detection: parent's children from a different other parent
            $siblingTypes = ['brother', 'sister', 'sibling'];
            if (in_array($inferredType['type'], $siblingTypes) && in_array($firstType, $parentTypes)) {
                if ($firstConnection->other_parent_id && $secondConnection->other_parent_id
                    && $firstConnection->other_parent_id !== $secondConnection->other_parent_id) {
                    $stepType = match ($inferredType['type']) {
                        'sister' => 'step_sister',
                        'sibling' => 'step_sibling',
                        default => 'step_brother',
                    };
                    $inferredType['type'] = $stepType;
                    $inferredType['label'] = $this->getRelationshipLabel($stepType);
                }
            }

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
                $inferred = ['type' => $result, 'confidence' => 99];
            }
        } else {
            // Fallback: default to the second relationship type if no specific rule
            $inferred = [
                'type' => $secondRelationType,
                'confidence' => 75,
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

            // Parent viewing child's parent (co-parent inference)
            // If X is my son/daughter, and X's mother/father is Y, then Y is my co-parent (wife/husband)
            'son_mother' => 'wife',
            'son_father' => 'husband',
            'daughter_mother' => 'wife',
            'daughter_father' => 'husband',

            // Parent viewing child's spouse (in-law inference)
            // If X is my son/daughter, and X's wife/husband is Y, then Y is my daughter/son-in-law
            'son_wife' => 'daughter_in_law',
            'son_husband' => 'son_in_law',
            'daughter_wife' => 'daughter_in_law',
            'daughter_husband' => 'son_in_law',
            'child_wife' => 'daughter_in_law',
            'child_husband' => 'son_in_law',

            // Viewing parent's spouse (other parent inference)
            // If X is my father/mother, and X's wife/husband is Y, then Y is my mother/father
            'father_wife' => 'mother',
            'mother_husband' => 'father',

            // Spouse viewing spouse's children (my spouse's children are my children)
            // If X is my husband/wife, and X's son/daughter is Y, then Y is my son/daughter
            'husband_son' => 'son',
            'husband_daughter' => 'daughter',
            'wife_son' => 'son',
            'wife_daughter' => 'daughter',

            // Spouse viewing spouse's grandchildren (my spouse's grandchild is my grandchild)
            'husband_grandson'    => 'grandson',
            'husband_granddaughter' => 'granddaughter',
            'husband_grandchild'  => 'grandchild',
            'wife_grandson'       => 'grandson',
            'wife_granddaughter'  => 'granddaughter',
            'wife_grandchild'     => 'grandchild',

            // Parent with child through siblings (parent viewing their children)
            'son_brother' => 'son',
            'son_sister' => 'daughter',
            'daughter_brother' => 'son',
            'daughter_sister' => 'daughter',

            // Grandparent relationships (parent → child → grandchild)
            'son_son' => 'grandson',
            'son_daughter' => 'granddaughter',
            'daughter_son' => 'grandson',
            'daughter_daughter' => 'granddaughter',

            // Parent's grandchildren are nieces/nephews (viewing through parent to their grandchild)
            'father_grandson' => 'nephew',
            'father_granddaughter' => 'niece',
            'mother_grandson' => 'nephew',
            'mother_granddaughter' => 'niece',
            'parent_grandson' => 'nephew',
            'parent_granddaughter' => 'niece',

            // Parent's children are siblings (parent → child → child)
            'mother_son' => 'brother',
            'mother_daughter' => 'sister',
            'father_son' => 'brother',
            'father_daughter' => 'sister',
            'parent_son' => 'brother',        // When parent gender unknown
            'parent_daughter' => 'sister',    // When parent gender unknown

            // Parent's siblings are aunts/uncles (parent → sibling)
            'mother_brother' => 'uncle',
            'mother_sister' => 'aunt',
            'father_brother' => 'uncle',
            'father_sister' => 'aunt',
            'parent_brother' => 'uncle',      // When parent gender unknown
            'parent_sister' => 'aunt',        // When parent gender unknown

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
            'parent_mother' => 'grandmother',  // When parent gender unknown
            'parent_father' => 'grandfather',  // When parent gender unknown
            'mother_child' => 'grandmother',
            'father_child' => 'grandfather',
            'parent_child' => 'grandparent',   // When both genders unknown

            // Extended relationships
            'sibling_child' => ['type' => 'nephew', 'confidence' => 99], // or niece
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

            // In-law relationships: via current spouse → their relatives
            'wife_mother'     => 'mother_in_law',
            'wife_father'     => 'father_in_law',
            'wife_brother'    => 'brother_in_law',
            'wife_sister'     => 'sister_in_law',
            'husband_mother'  => 'mother_in_law',
            'husband_father'  => 'father_in_law',
            'husband_brother' => 'brother_in_law',
            'husband_sister'  => 'sister_in_law',
            'partner_mother'  => 'mother_in_law',
            'partner_father'  => 'father_in_law',
            'partner_brother' => 'brother_in_law',
            'partner_sister'  => 'sister_in_law',

            // In-law relationships: via sibling → their spouse
            'brother_wife'    => 'sister_in_law',
            'brother_husband' => 'brother_in_law',
            'sister_wife'     => 'sister_in_law',
            'sister_husband'  => 'brother_in_law',

            // In-law relationships: via sibling → their in-laws (sibling's in-laws are your in-laws)
            'brother_mother_in_law'  => 'mother_in_law',
            'brother_father_in_law'  => 'father_in_law',
            'brother_brother_in_law' => 'brother_in_law',
            'brother_sister_in_law'  => 'sister_in_law',
            'sister_mother_in_law'   => 'mother_in_law',
            'sister_father_in_law'   => 'father_in_law',
            'sister_brother_in_law'  => 'brother_in_law',
            'sister_sister_in_law'   => 'sister_in_law',

            // In-law relationships: via parent → their in-laws (parent's in-laws are your in-laws)
            'son_mother_in_law'      => 'mother_in_law',
            'son_father_in_law'      => 'father_in_law',
            'son_brother_in_law'     => 'brother_in_law',
            'son_sister_in_law'      => 'sister_in_law',
            'daughter_mother_in_law' => 'mother_in_law',
            'daughter_father_in_law' => 'father_in_law',
            'daughter_brother_in_law'=> 'brother_in_law',
            'daughter_sister_in_law' => 'sister_in_law',
            'child_mother_in_law'    => 'mother_in_law',
            'child_father_in_law'    => 'father_in_law',
            'child_brother_in_law'   => 'brother_in_law',
            'child_sister_in_law'    => 'sister_in_law',

            // In-law relationships: via in-law parent → their children/grandchildren
            'father_in_law_son'           => 'brother_in_law',
            'father_in_law_daughter'      => 'sister_in_law',
            'mother_in_law_son'           => 'brother_in_law',
            'mother_in_law_daughter'      => 'sister_in_law',
            'father_in_law_grandson'      => 'nephew',
            'father_in_law_granddaughter' => 'niece',
            'father_in_law_grandchild'    => 'nephew',
            'mother_in_law_grandson'      => 'nephew',
            'mother_in_law_granddaughter' => 'niece',
            'mother_in_law_grandchild'    => 'nephew',

            // In-law relationships: via in-law sibling → their children
            'brother_in_law_son'       => 'nephew',
            'brother_in_law_daughter'  => 'niece',
            'sister_in_law_son'        => 'nephew',
            'sister_in_law_daughter'   => 'niece',

            // Via spouse → their nephew/niece (husband's brother's child)
            'husband_nephew'  => 'nephew',
            'husband_niece'   => 'niece',
            'wife_nephew'     => 'nephew',
            'wife_niece'      => 'niece',
            'partner_nephew'  => 'nephew',
            'partner_niece'   => 'niece',

            // Default fallbacks
            'child_child' => 'cousin',
            'son_child' => 'nephew',
            'daughter_child' => 'niece',
        ];
    }

    /**
     * Get the inverse relationship type
     * Gender-aware for relationships where the inverse depends on the requester's gender
     */
    public function getInverseRelationship(string $relationshipType, ?string $requesterGender = null): string
    {
        // Gender-aware inverse for sibling relationships
        if ($relationshipType === 'brother' || $relationshipType === 'sister') {
            if ($requesterGender === 'female') {
                return 'sister';
            } elseif ($requesterGender === 'male') {
                return 'brother';
            }
            return 'sibling';
        }

        // Gender-aware inverse for parent-child relationships
        if ($relationshipType === 'son' || $relationshipType === 'daughter') {
            if ($requesterGender === 'female') {
                return 'mother';
            } elseif ($requesterGender === 'male') {
                return 'father';
            }
            return 'parent';
        }

        // Gender-aware inverse: mother/father/parent → son/daughter/child based on requester gender
        if ($relationshipType === 'mother' || $relationshipType === 'father' || $relationshipType === 'parent') {
            if ($requesterGender === 'female') {
                return 'daughter';
            } elseif ($requesterGender === 'male') {
                return 'son';
            }
            return 'child';
        }

        // Gender-aware inverse for grandparent-grandchild relationships
        if ($relationshipType === 'grandson' || $relationshipType === 'granddaughter') {
            if ($requesterGender === 'female') {
                return 'grandmother';
            } elseif ($requesterGender === 'male') {
                return 'grandfather';
            }
            return 'grandparent';
        }

        // Gender-aware inverse for niece/nephew
        if ($relationshipType === 'niece' || $relationshipType === 'nephew') {
            if ($requesterGender === 'female') {
                return 'aunt';
            } elseif ($requesterGender === 'male') {
                return 'uncle';
            }
            return 'aunt'; // fallback
        }

        // Gender-aware inverse for aunt/uncle
        if ($relationshipType === 'aunt' || $relationshipType === 'uncle') {
            if ($requesterGender === 'female') {
                return 'niece';
            } elseif ($requesterGender === 'male') {
                return 'nephew';
            }
            return 'nephew'; // fallback
        }

        // Gender-aware inverse for step-child relationships
        if ($relationshipType === 'step_son' || $relationshipType === 'step_daughter') {
            if ($requesterGender === 'female') {
                return 'step_mother';
            } elseif ($requesterGender === 'male') {
                return 'step_father';
            }
            return 'step_father'; // fallback
        }

        if ($relationshipType === 'step_mother' || $relationshipType === 'step_father') {
            if ($requesterGender === 'female') {
                return 'step_daughter';
            } elseif ($requesterGender === 'male') {
                return 'step_son';
            }
            return 'step_child'; // fallback
        }

        // Gender-aware inverse for in-law relationships
        if ($relationshipType === 'mother_in_law' || $relationshipType === 'father_in_law') {
            if ($requesterGender === 'female') {
                return 'daughter_in_law';
            } elseif ($requesterGender === 'male') {
                return 'son_in_law';
            }
            return 'son_in_law'; // fallback
        }

        if ($relationshipType === 'sister_in_law' || $relationshipType === 'brother_in_law') {
            if ($requesterGender === 'female') {
                return 'sister_in_law';
            } elseif ($requesterGender === 'male') {
                return 'brother_in_law';
            }
            return 'brother_in_law'; // fallback
        }

        if ($relationshipType === 'son_in_law' || $relationshipType === 'daughter_in_law') {
            if ($requesterGender === 'female') {
                return 'mother_in_law';
            } elseif ($requesterGender === 'male') {
                return 'father_in_law';
            }
            return 'father_in_law'; // fallback
        }

        // Gender-aware inverse for ex-in-law relationships
        if ($relationshipType === 'ex_mother_in_law' || $relationshipType === 'ex_father_in_law') {
            if ($requesterGender === 'female') {
                return 'ex_daughter_in_law';
            } elseif ($requesterGender === 'male') {
                return 'ex_son_in_law';
            }
            return 'ex_son_in_law'; // fallback
        }

        if ($relationshipType === 'ex_sister_in_law' || $relationshipType === 'ex_brother_in_law') {
            if ($requesterGender === 'female') {
                return 'ex_sister_in_law';
            } elseif ($requesterGender === 'male') {
                return 'ex_brother_in_law';
            }
            return 'ex_brother_in_law'; // fallback
        }

        $inverseMap = [
            // Sibling relationships (gender-neutral)
            'sibling' => 'sibling',

            // Parent-child
            'mother' => 'child',
            'father' => 'child',
            'child' => 'parent',

            // Grandparent
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandchild' => 'grandparent',

            // Extended family (aunt/uncle and niece/nephew are handled by gender-aware logic above)
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
            'step_son' => 'Step-son',
            'step_daughter' => 'Step-daughter',
            'step_brother' => 'Step-brother',
            'step_sister' => 'Step-sister',
            'step_sibling' => 'Step-sibling',
            'step_child' => 'Step-child',
            'mother_in_law' => 'Mother-in-law',
            'father_in_law' => 'Father-in-law',
            'sister_in_law' => 'Sister-in-law',
            'brother_in_law' => 'Brother-in-law',
            'son_in_law' => 'Son-in-law',
            'daughter_in_law' => 'Daughter-in-law',
            'ex_mother_in_law' => 'Ex-mother-in-law',
            'ex_father_in_law' => 'Ex-father-in-law',
            'ex_sister_in_law' => 'Ex-sister-in-law',
            'ex_brother_in_law' => 'Ex-brother-in-law',
            'ex_daughter_in_law' => 'Ex-daughter-in-law',
            'ex_son_in_law' => 'Ex-son-in-law',
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
