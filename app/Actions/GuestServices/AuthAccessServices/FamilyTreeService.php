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

            // Check if this is a divorced spouse - update relationship type
            $isDivorced = $connection->isDivorced();
            if ($isDivorced && in_array($relationshipType, ['wife', 'husband', 'partner'])) {
                $relationshipType = 'ex_' . $relationshipType;
            }

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

            // Skip non-primary relationship types that should only be derived through the tree,
            // not stored as direct connections. These may exist from the suggested connections
            // page which sometimes stores inferred types. They will be properly derived through
            // second-level traversal instead.
            $derivedOnlyTypes = [
                'grandmother', 'grandfather', 'grandparent',
                'great_grandmother', 'great_grandfather',
                'great_grandchild', 'great_grandson', 'great_granddaughter',
                'great_great_grandmother', 'great_great_grandfather',
                'great_great_grandchild', 'great_great_grandson', 'great_great_granddaughter',
                'uncle', 'aunt', 'uncle_by_marriage', 'aunt_by_marriage',
                'nephew_by_marriage', 'niece_by_marriage',
                'cousin', 'first_cousin', 'second_cousin', 'third_cousin',
                'mother_in_law', 'father_in_law', 'sister_in_law', 'brother_in_law',
                'daughter_in_law', 'son_in_law',
                'ex_mother_in_law', 'ex_father_in_law', 'ex_sister_in_law', 'ex_brother_in_law',
                'ex_daughter_in_law', 'ex_son_in_law',
                'co_wife', 'co_husband',
            ];
            if (in_array($relationshipType, $derivedOnlyTypes)) {
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
                'isDivorced' => $isDivorced,
            ];
        }

        // Step 1.5: Detect step-parents and step-siblings
        // When a child is the center point, some "parents" may be step-parents and
        // some "siblings" may be step-siblings. Detect by finding the real parent pair
        // (parents who are/were spouses AND share the most children with root's siblings).
        $allStepIds = [];
        $parentNodeIds = [];
        foreach ($nodes as $node) {
            if (in_array($node['relationshipType'], ['father', 'mother', 'parent'])) {
                $parentNodeIds[] = $node['id'];
            }
        }

        if (count($parentNodeIds) >= 2) {
            $siblingNodeIds = [];
            foreach ($nodes as $node) {
                if (in_array($node['relationshipType'], ['brother', 'sister', 'sibling'])) {
                    $siblingNodeIds[] = $node['id'];
                }
            }

            // Try precise detection using other_parent_id first
            $realParentPair = [];
            $allParentConnsHaveOtherParent = true;
            foreach ($parentNodeIds as $pid) {
                $parentToRoot = $this->connectionRepository->getConnectionBetween($userId, $pid);
                if (!$parentToRoot || $parentToRoot->other_parent_id === null) {
                    $allParentConnsHaveOtherParent = false;
                    break;
                }
            }

            if ($allParentConnsHaveOtherParent) {
                // Find parents that reference each other via other_parent_id
                foreach ($parentNodeIds as $pid) {
                    $parentToRoot = $this->connectionRepository->getConnectionBetween($userId, $pid);
                    $otherPid = $parentToRoot->other_parent_id;
                    if (in_array($otherPid, $parentNodeIds)) {
                        // Verify mutual: the other parent's connection also references this one
                        $otherParentToRoot = $this->connectionRepository->getConnectionBetween($userId, $otherPid);
                        if ($otherParentToRoot && $otherParentToRoot->other_parent_id === $pid) {
                            $realParentPair = [$pid, $otherPid];
                            break;
                        }
                    }
                }
            }

            // Fallback: heuristic scoring when other_parent_id is not available
            if (empty($realParentPair)) {
                $parentPairs = [];
                for ($i = 0; $i < count($parentNodeIds); $i++) {
                    for ($j = $i + 1; $j < count($parentNodeIds); $j++) {
                        $spouseConn = $this->connectionRepository->getConnectionBetween($parentNodeIds[$i], $parentNodeIds[$j]);
                        if ($spouseConn) {
                            $spRelType = $this->getRelationshipFromUserPerspective($spouseConn, $parentNodeIds[$i]);
                            if (in_array($spRelType, ['wife', 'husband', 'partner'])) {
                                $sharedChildren = 0;
                                foreach ($siblingNodeIds as $sibId) {
                                    $hasConn1 = $this->connectionRepository->getConnectionBetween($sibId, $parentNodeIds[$i]) !== null;
                                    $hasConn2 = $this->connectionRepository->getConnectionBetween($sibId, $parentNodeIds[$j]) !== null;
                                    if ($hasConn1 && $hasConn2) {
                                        $sharedChildren++;
                                    }
                                }
                                $parentPairs[] = [
                                    'pair' => [$parentNodeIds[$i], $parentNodeIds[$j]],
                                    'sharedChildren' => $sharedChildren,
                                ];
                            }
                        }
                    }
                }

                // Best pair = most shared children
                usort($parentPairs, fn($a, $b) => $b['sharedChildren'] - $a['sharedChildren']);
                $realParentPair = !empty($parentPairs) ? $parentPairs[0]['pair'] : [];
            }

            if (!empty($realParentPair)) {
                // Parents not in the real pair → step-parents
                $stepParentIds = [];
                foreach ($parentNodeIds as $pid) {
                    if (!in_array($pid, $realParentPair)) {
                        $stepParentIds[] = $pid;
                    }
                }

                // Siblings whose parent-pair doesn't match root's → step-siblings
                // Use other_parent_id for precise detection when available.
                // Logic per sibling:
                //   - other_parent_id set AND matches the other parent → real sibling (definite)
                //   - other_parent_id set AND doesn't match → step-sibling (definite)
                //   - other_parent_id NULL but connected to a parent → real sibling (benefit of doubt)
                //   - not connected to any parent → real sibling (benefit of doubt / missing data)
                $stepSiblingIds = [];
                foreach ($siblingNodeIds as $sibId) {
                    $isRealSibling = false;
                    $hasDefiniteMismatch = false;

                    foreach ($realParentPair as $rpId) {
                        $sibToParent = $this->connectionRepository->getConnectionBetween($sibId, $rpId);
                        if (!$sibToParent) {
                            continue;
                        }

                        if ($sibToParent->other_parent_id !== null) {
                            // Precise check: does the other_parent_id match the other parent in the pair?
                            $otherParentInPair = ($rpId === $realParentPair[0]) ? $realParentPair[1] : $realParentPair[0];
                            if ($sibToParent->other_parent_id === $otherParentInPair) {
                                $isRealSibling = true;
                                break;
                            } else {
                                // other_parent_id points to someone outside the real pair → step-sibling
                                $hasDefiniteMismatch = true;
                            }
                        } else {
                            // Connected to parent but other_parent_id not set — benefit of doubt
                            $isRealSibling = true;
                            break;
                        }
                    }

                    // If not connected to any parent and no definite mismatch, give benefit of doubt
                    if (!$isRealSibling && !$hasDefiniteMismatch) {
                        $isRealSibling = true;
                    }

                    if (!$isRealSibling) {
                        $stepSiblingIds[] = $sibId;
                    }
                }

                $allStepIds = array_merge($stepParentIds, $stepSiblingIds);

                if (!empty($allStepIds)) {
                    // Remove step nodes and their edges from first-level data
                    // Keep them in processedUsers to prevent addSecondLevelConnections from re-adding them
                    $nodes = array_values(array_filter($nodes, fn($node) => !in_array($node['id'], $allStepIds)));
                    $edges = array_values(array_filter($edges, fn($edge) =>
                        !in_array($edge['source'], $allStepIds) && !in_array($edge['target'], $allStepIds)
                    ));
                    $firstLevelUsers = array_values(array_filter($firstLevelUsers, fn($id) => !in_array($id, $allStepIds)));
                }
            }
        }

        // Step 2: Now process second-level connections for each first-level user
        // IMPORTANT: Process sons/daughters FIRST so grandchildren are connected through their parent
        // Sort first level users to process children (son/daughter) before spouse (wife/husband)
        $sortedFirstLevelUsers = [];
        $childConnections = [];
        $otherConnections = [];
        $parentConnections = [];

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
            } elseif (in_array($relationshipType, ['father', 'mother', 'parent'])) {
                $parentConnections[] = $connectedUser->id;
            } elseif (in_array($relationshipType, ['wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner'])) {
                // Spouses are excluded from second-level traversal.
                // Their extended family (parents, siblings, other spouses, other children)
                // should NOT appear in the root user's tree. Shared children are already
                // direct connections of the root user.
                continue;
            } else {
                $otherConnections[] = $connectedUser->id;
            }
        }

        // Only children need second-level traversal (for grandchildren and in-laws).
        // Parents are handled by addParentFamilyUnits (Step 3).
        // Spouses, siblings, step-children, and other types should not contribute second-level nodes.
        $sortedFirstLevelUsers = $childConnections;

        foreach ($sortedFirstLevelUsers as $connectedUserId) {
            $this->addSecondLevelConnections(
                $connectedUserId,
                $userId,
                $nodes,
                $edges,
                $processedUsers
            );
        }

        // Build spouse groups for child-to-spouse mapping
        $spouseGroups = [];
        $spouseIds = [];
        foreach ($allConnections as $connection) {
            $connectedUser = $connection->requester_user_id === $userId
                ? $connection->recipient
                : $connection->requester;
            $relType = $this->getRelationshipFromUserPerspective($connection, $userId);
            if (in_array($relType, ['wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner'])) {
                $spouseIds[$connectedUser->id] = $connection->isDivorced();
            }
        }

        foreach ($spouseIds as $spouseId => $isDivorced) {
            $groupChildIds = [];
            foreach ($childConnections as $childId) {
                // Check other_parent_id on root-to-child connection first
                $rootToChild = $this->connectionRepository->getConnectionBetween($childId, $userId);
                $matched = false;
                if ($rootToChild && $rootToChild->other_parent_id !== null) {
                    // Precise match: other_parent_id tells us exactly which spouse
                    $matched = ($rootToChild->other_parent_id === $spouseId);
                } else {
                    // Fallback for legacy data: check if child is connected to this spouse
                    $childToSpouse = $this->connectionRepository->getConnectionBetween($childId, $spouseId);
                    $matched = ($childToSpouse !== null);
                }

                if ($matched) {
                    $groupChildIds[] = $childId;
                    // Tag the child node with spouseGroupId
                    foreach ($nodes as &$node) {
                        if ($node['id'] === $childId) {
                            $node['spouseGroupId'] = $spouseId;
                            break;
                        }
                    }
                    unset($node);
                }
            }
            $spouseGroups[] = [
                'spouseId' => $spouseId,
                'isDivorced' => $isDivorced,
                'childIds' => $groupChildIds,
            ];
        }

        // Build child spouse groups: for each child, find their in-law spouses and group grandchildren
        $childSpouseGroups = [];
        foreach ($childConnections as $childId) {
            // Find in-law nodes connected to this child (from edges)
            $childInLaws = [];
            foreach ($edges as $edge) {
                if ($edge['source'] === $childId &&
                    in_array($edge['relationshipType'], ['daughter_in_law', 'son_in_law', 'ex_daughter_in_law', 'ex_son_in_law'])) {
                    $childInLaws[] = [
                        'spouseId' => $edge['target'],
                        'isDivorced' => $edge['isDivorced'] ?? false,
                    ];
                }
            }

            foreach ($childInLaws as $inLaw) {
                $groupGrandchildIds = [];

                // Find grandchildren that belong to this child+in-law pair
                foreach ($nodes as &$node) {
                    if (!in_array($node['relationshipType'], ['grandson', 'granddaughter', 'grandchild'])) {
                        continue;
                    }

                    // Check if this grandchild is connected to this child via edges
                    $connectedToChild = false;
                    foreach ($edges as $edge) {
                        if ($edge['source'] === $childId && $edge['target'] === $node['id'] &&
                            in_array($edge['relationshipType'], ['son', 'daughter', 'child', 'grandson', 'granddaughter', 'grandchild'])) {
                            $connectedToChild = true;
                            break;
                        }
                    }

                    if (!$connectedToChild) {
                        continue;
                    }

                    // Use other_parent_id on child→grandchild connection for precise matching
                    $childToGrandchild = $this->connectionRepository->getConnectionBetween($node['id'], $childId);
                    $matched = false;
                    if ($childToGrandchild && $childToGrandchild->other_parent_id !== null) {
                        $matched = ($childToGrandchild->other_parent_id === $inLaw['spouseId']);
                    } else {
                        // Fallback: check if grandchild is connected to the in-law spouse
                        $grandchildToInLaw = $this->connectionRepository->getConnectionBetween($node['id'], $inLaw['spouseId']);
                        $matched = ($grandchildToInLaw !== null);
                    }

                    if ($matched) {
                        $groupGrandchildIds[] = $node['id'];
                        $node['childSpouseGroupId'] = $inLaw['spouseId'];
                    }
                }
                unset($node);

                $childSpouseGroups[] = [
                    'childId' => $childId,
                    'spouseId' => $inLaw['spouseId'],
                    'isDivorced' => $inLaw['isDivorced'],
                    'grandchildIds' => $groupGrandchildIds,
                ];
            }
        }

        // Step 3: Build parent family units (extended family through parents)
        // Unmark step-parents/siblings so addParentFamilyUnits can discover them through parent traversal
        foreach ($allStepIds as $stepId) {
            unset($processedUsers[$stepId]);
        }

        $parentFamilyUnits = $this->addParentFamilyUnits(
            $userId,
            $parentConnections,
            $childConnections,
            $nodes,
            $edges,
            $processedUsers
        );

        // Check if parents are/were married to add a horizontal connection between them
        $parentConnection = null;
        if (count($parentConnections) >= 2) {
            for ($i = 0; $i < count($parentConnections); $i++) {
                for ($j = $i + 1; $j < count($parentConnections); $j++) {
                    $pConn = $this->connectionRepository->getConnectionBetween($parentConnections[$i], $parentConnections[$j]);
                    if ($pConn) {
                        $pRelType = $this->getRelationshipFromUserPerspective($pConn, $parentConnections[$i]);
                        if (in_array($pRelType, ['wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner'])) {
                            $parentConnection = [
                                'parent1Id' => $parentConnections[$i],
                                'parent2Id' => $parentConnections[$j],
                                'isDivorced' => $pConn->isDivorced(),
                            ];
                            break 2;
                        }
                    }
                }
            }
        }

        return [
            'nodes' => $nodes,
            'edges' => $edges,
            'rootUserId' => $userId,
            'spouseGroups' => $spouseGroups,
            'childSpouseGroups' => $childSpouseGroups,
            'parentFamilyUnits' => $parentFamilyUnits,
            'parentConnection' => $parentConnection,
        ];
    }

    /**
     * Build parent family units: traverse each parent's connections to find
     * grandparents, uncles/aunts, step-parents, and step-siblings with correct
     * relationship labels from the root user's perspective.
     */
    private function addParentFamilyUnits(
        int $rootUserId,
        array $parentIds,
        array $rootChildIds,
        array &$nodes,
        array &$edges,
        array &$processedUsers
    ): array {
        $parentFamilyUnits = [];

        // Collect root's sibling IDs (already in nodes) to avoid duplicating them
        $rootSiblingIds = [];
        foreach ($nodes as $node) {
            if (in_array($node['relationshipType'], ['brother', 'sister', 'sibling'])) {
                $rootSiblingIds[] = $node['id'];
            }
        }

        // Collect root's spouse IDs (already in nodes)
        $rootSpouseIds = [];
        foreach ($nodes as $node) {
            if (in_array($node['relationshipType'], ['wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner'])) {
                $rootSpouseIds[] = $node['id'];
            }
        }

        foreach ($parentIds as $parentId) {
            $parentConnections = $this->connectionRepository->getConnections($parentId);
            $parentUser = User::find($parentId);
            $parentGender = $parentUser?->gender;

            $unitSiblings = [];   // parent's siblings → uncle/aunt
            $unitParents = [];    // parent's parents → grandfather/grandmother
            $unitOtherSpouses = []; // parent's other spouses → step_mother/step_father

            foreach ($parentConnections as $connection) {
                $otherUser = $connection->requester_user_id === $parentId
                    ? $connection->recipient
                    : $connection->requester;

                // Skip root user and already-processed users
                if ($otherUser->id === $rootUserId) {
                    continue;
                }

                $relType = $this->getRelationshipFromUserPerspective($connection, $parentId);

                // Parent's siblings → uncle/aunt from root's perspective
                if (in_array($relType, ['brother', 'sister', 'sibling'])) {
                    if (!isset($processedUsers[$otherUser->id])) {
                        $derivedType = $this->deriveExtendedRelationship('parent_sibling', $otherUser->gender);
                        $nodes[] = $this->formatUserNode($otherUser, $derivedType);
                        $processedUsers[$otherUser->id] = true;
                        $unitSiblings[] = $otherUser->id;

                        $edges[] = [
                            'id' => "edge-{$parentId}-{$otherUser->id}",
                            'source' => $parentId,
                            'target' => $otherUser->id,
                            'relationshipType' => $derivedType,
                            'label' => $this->formatRelationshipLabel($derivedType),
                            'color' => $this->getRelationshipColor($derivedType),
                            'isDivorced' => false,
                        ];
                    }
                }

                // Parent's parents → grandfather/grandmother from root's perspective
                if (in_array($relType, ['father', 'mother', 'parent'])) {
                    if (!isset($processedUsers[$otherUser->id])) {
                        $derivedType = $this->deriveExtendedRelationship('parent_parent', $otherUser->gender);
                        $nodes[] = $this->formatUserNode($otherUser, $derivedType);
                        $processedUsers[$otherUser->id] = true;
                        $unitParents[] = $otherUser->id;

                        $edges[] = [
                            'id' => "edge-{$parentId}-{$otherUser->id}",
                            'source' => $parentId,
                            'target' => $otherUser->id,
                            'relationshipType' => $derivedType,
                            'label' => $this->formatRelationshipLabel($derivedType),
                            'color' => $this->getRelationshipColor($derivedType),
                            'isDivorced' => false,
                        ];
                    }
                }

                // Parent's spouse who is NOT already a parent of root → step_mother/step_father
                if (in_array($relType, ['wife', 'husband', 'partner'])) {
                    // Check if this spouse is already a parent of the root user (directly or via sibling)
                    if (in_array($otherUser->id, $parentIds) || in_array($otherUser->id, $rootSpouseIds)) {
                        continue;
                    }

                    // Also skip if this spouse already appears in nodes as a parent type
                    // (e.g. discovered through a sibling's second-level connections)
                    $alreadyParentNode = false;
                    foreach ($nodes as $node) {
                        if ($node['id'] === $otherUser->id && in_array($node['relationshipType'], ['father', 'mother', 'parent'])) {
                            $alreadyParentNode = true;
                            break;
                        }
                    }
                    if ($alreadyParentNode) {
                        continue;
                    }

                    $isDivorced = $connection->isDivorced();

                    if (!isset($processedUsers[$otherUser->id])) {
                        $derivedType = $this->deriveExtendedRelationship('parent_spouse', $otherUser->gender);
                        $nodes[] = $this->formatUserNode($otherUser, $derivedType);
                        $processedUsers[$otherUser->id] = true;

                        $edges[] = [
                            'id' => "edge-{$parentId}-{$otherUser->id}",
                            'source' => $parentId,
                            'target' => $otherUser->id,
                            'relationshipType' => $derivedType,
                            'label' => $this->formatRelationshipLabel($derivedType),
                            'color' => $this->getRelationshipColor($derivedType),
                            'isDivorced' => $isDivorced,
                        ];
                    }

                    // Find children of parent+otherSpouse that are NOT root's siblings
                    // Use other_parent_id for precise parent-pair matching when available
                    $stepChildIds = [];
                    $otherSpouseConnections = $this->connectionRepository->getConnections($otherUser->id);
                    foreach ($otherSpouseConnections as $spouseConn) {
                        $spouseOther = $spouseConn->requester_user_id === $otherUser->id
                            ? $spouseConn->recipient
                            : $spouseConn->requester;

                        $spouseRelType = $this->getRelationshipFromUserPerspective($spouseConn, $otherUser->id);

                        if (in_array($spouseRelType, ['son', 'daughter', 'child'])) {
                            // Skip if it's the root user or already a sibling of root
                            if ($spouseOther->id === $rootUserId
                                || in_array($spouseOther->id, $rootSiblingIds)
                                || in_array($spouseOther->id, $rootChildIds)) {
                                continue;
                            }

                            // Use other_parent_id to verify this child belongs to parent + otherSpouse
                            if ($spouseConn->other_parent_id !== null) {
                                // Precise: only include if the other parent matches the current parent
                                if ($spouseConn->other_parent_id !== $parentId) {
                                    // Child belongs to otherSpouse + someone else, not this parent
                                    continue;
                                }
                            } else {
                                // Fallback: check if this child is connected to the parent
                                $childToParent = $this->connectionRepository->getConnectionBetween($spouseOther->id, $parentId);
                                if (!$childToParent) {
                                    // Not connected to parent, skip
                                    continue;
                                }
                            }

                            // Skip if already shown in the tree
                            // Children removed by Step 1.5 (step-siblings) were unset from
                            // processedUsers, so they should be re-added here.
                            if (isset($processedUsers[$spouseOther->id])) {
                                continue;
                            }

                            $stepType = $this->deriveExtendedRelationship('parent_spouse_child', $spouseOther->gender);
                            $nodes[] = $this->formatUserNode($spouseOther, $stepType);
                            $processedUsers[$spouseOther->id] = true;
                            $stepChildIds[] = $spouseOther->id;

                            $edges[] = [
                                'id' => "edge-{$otherUser->id}-{$spouseOther->id}",
                                'source' => $otherUser->id,
                                'target' => $spouseOther->id,
                                'relationshipType' => $stepType,
                                'label' => $this->formatRelationshipLabel($stepType),
                                'color' => $this->getRelationshipColor($stepType),
                                'isDivorced' => false,
                            ];
                        }
                    }

                    $unitOtherSpouses[] = [
                        'spouseId' => $otherUser->id,
                        'isDivorced' => $isDivorced,
                        'childIds' => $stepChildIds,
                    ];
                }

            }

            // Only include this unit if it has actual members (siblings, parents, or other spouses).
            // Empty units (no extended family discovered) add no value and can cause
            // phantom rendering artefacts on the frontend.
            if (!empty($unitSiblings) || !empty($unitParents) || !empty($unitOtherSpouses)) {
                $parentFamilyUnits[] = [
                    'parentId' => $parentId,
                    'siblings' => $unitSiblings,
                    'parents' => $unitParents,
                    'otherSpouses' => $unitOtherSpouses,
                ];
            }
        }

        return $parentFamilyUnits;
    }

    /**
     * Derive extended relationship label from the root user's perspective
     */
    private function deriveExtendedRelationship(string $chainType, ?string $gender): string
    {
        return match ($chainType) {
            'parent_sibling' => match ($gender) {
                'male' => 'uncle',
                'female' => 'aunt',
                default => 'uncle',
            },
            'parent_parent' => match ($gender) {
                'male' => 'grandfather',
                'female' => 'grandmother',
                default => 'grandparent',
            },
            'parent_spouse' => match ($gender) {
                'male' => 'step_father',
                'female' => 'step_mother',
                default => 'step_parent',
            },
            'parent_spouse_child' => match ($gender) {
                'male' => 'step_brother',
                'female' => 'step_sister',
                default => 'step_sibling',
            },
            default => 'relative',
        };
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

            // Siblings should not contribute any second-level nodes to the tree.
            // Their extended family is handled through parentFamilyUnits (Step 3).
            if (in_array($firstLevelRelationship, ['brother', 'sister', 'sibling'])) {
                continue;
            }

            // For children, only allow their own children (grandchildren) and spouses (in-laws).
            // Skip everything else (siblings, parents, grandparents, uncles, aunts, etc.)
            if (in_array($firstLevelRelationship, ['son', 'daughter', 'child']) &&
                !in_array($relationshipType, ['son', 'daughter', 'child', 'wife', 'husband', 'partner'])) {
                continue;
            }

            // Skip parents' grandchildren (which are actually siblings' children = nephews/nieces)
            if (in_array($firstLevelRelationship, ['father', 'mother', 'parent']) &&
                in_array($relationshipType, ['grandson', 'granddaughter', 'grandchild'])) {
                continue;
            }

            // For spouses, only allow their children through (which are also root's children).
            // Skip everything else (parents, siblings, grandparents, etc.)
            if (in_array($firstLevelRelationship, ['wife', 'husband', 'partner', 'ex_wife', 'ex_husband', 'ex_partner']) &&
                !in_array($relationshipType, ['son', 'daughter', 'child'])) {
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

            // If first level is son/daughter and second level is their spouse, it's a child-in-law to root
            if (in_array($firstLevelRelationship, ['son', 'daughter', 'child']) &&
                in_array($relationshipType, ['wife', 'husband', 'partner'])) {
                $nodeRelationshipType = $secondLevelUser->gender === 'female' ? 'daughter_in_law' : 'son_in_law';
                $isDivorced = $connection->isDivorced();
                if ($isDivorced) {
                    $nodeRelationshipType = 'ex_' . $nodeRelationshipType;
                }
            }

            $nodes[] = $this->formatUserNode($secondLevelUser, $nodeRelationshipType);
            $processedUsers[$secondLevelUser->id] = true;

            // Determine if this edge represents a divorced connection
            $edgeIsDivorced = false;
            if (in_array($firstLevelRelationship, ['son', 'daughter', 'child']) &&
                in_array($relationshipType, ['wife', 'husband', 'partner'])) {
                $edgeIsDivorced = $connection->isDivorced();
            }

            // Create edge between the first level connection and second level user
            // Edge label shows the relationship from first level user's perspective
            $edges[] = [
                'id' => "edge-{$connectedUserId}-{$secondLevelUser->id}",
                'source' => $connectedUserId,
                'target' => $secondLevelUser->id,
                'relationshipType' => $nodeRelationshipType,
                'label' => $this->formatRelationshipLabel($nodeRelationshipType),
                'color' => $this->getRelationshipColor($nodeRelationshipType),
                'isDivorced' => $edgeIsDivorced,
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
            'ex_wife' => 'Prev. Spouse',
            'ex_husband' => 'Prev. Spouse',
            'ex_partner' => 'Prev. Spouse',
            'step_mother' => 'Step Mother',
            'step_father' => 'Step Father',
            'step_brother' => 'Step Brother',
            'step_sister' => 'Step Sister',
            'step_sibling' => 'Step Sibling',
            'step_parent' => 'Step Parent',
            'daughter_in_law' => 'Daughter-in-law',
            'son_in_law' => 'Son-in-law',
            'ex_daughter_in_law' => 'Ex Daughter-in-law',
            'ex_son_in_law' => 'Ex Son-in-law',
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
            'ex_wife' => '#9CA3AF',     // Gray
            'ex_husband' => '#9CA3AF',  // Gray
            'ex_partner' => '#9CA3AF',  // Gray
            'step_mother' => '#F472B6', // Pink
            'step_father' => '#3B82F6', // Blue
            'step_brother' => '#8B5CF6', // Purple
            'step_sister' => '#EF4444',  // Red
            'step_sibling' => '#8B5CF6', // Purple
            'step_parent' => '#6366F1',  // Indigo
            'daughter_in_law' => '#F472B6', // Pink
            'son_in_law' => '#06B6D4',     // Cyan
            'ex_daughter_in_law' => '#9CA3AF', // Gray
            'ex_son_in_law' => '#9CA3AF',     // Gray
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
            'ex_wife' => '#F3F4F6',     // Light gray
            'ex_husband' => '#F3F4F6',  // Light gray
            'ex_partner' => '#F3F4F6',  // Light gray
            'step_mother' => '#FCE7F3', // Light pink
            'step_father' => '#DBEAFE', // Light blue
            'step_brother' => '#EDE9FE', // Light purple
            'step_sister' => '#FEE2E2',  // Light red
            'step_sibling' => '#EDE9FE', // Light purple
            'step_parent' => '#E0E7FF',  // Light indigo
            'uncle' => '#ECFCCB',        // Light lime
            'aunt' => '#FED7AA',         // Light orange
            'grandfather' => '#E0E7FF',  // Light indigo
            'grandmother' => '#F3E8FF',  // Light violet
            'daughter_in_law' => '#FCE7F3', // Light pink
            'son_in_law' => '#CFFAFE',     // Light cyan
            'ex_daughter_in_law' => '#F3F4F6', // Light gray
            'ex_son_in_law' => '#F3F4F6',     // Light gray
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
     * Build a family group tree structure for visualization
     * Handles both single families and merged families (with containers)
     *
     * @param int $familyTreeId
     * @return array
     */
    public function buildFamilyGroupTree(int $familyTreeId): array
    {
        $familyTree = $this->familyTreeRepository->getTree($familyTreeId);

        if (!$familyTree) {
            return [
                'familyTreeId' => $familyTreeId,
                'familyTreeUuid' => null,
                'familyName' => 'Unknown',
                'isMerged' => false,
                'containers' => [],
                'containerConnections' => [],
            ];
        }

        $containers = [];
        $containerConnections = [];

        // Build the main family container (the root tree)
        $mainContainer = $this->buildFamilyContainer(
            $familyTree->id,
            $familyTree->tree_name,
            $familyTree->root_user_id
        );
        $containers[] = $mainContainer;

        // Check if there are merged trees
        $mergedTreeIds = $familyTree->merged_tree_ids ?? [];
        $isMerged = !empty($mergedTreeIds);

        if ($isMerged) {
            // Get the merged trees (including soft-deleted)
            $mergedTrees = $this->familyTreeRepository->getMergedTrees($mergedTreeIds);

            foreach ($mergedTrees as $mergedTree) {
                // Build container for each merged family
                $mergedContainer = $this->buildFamilyContainer(
                    $mergedTree->id,
                    $mergedTree->tree_name,
                    $mergedTree->root_user_id
                );
                $containers[] = $mergedContainer;

                // Create connection between main tree and merged tree
                $containerConnections[] = [
                    'id' => "connection-{$familyTree->id}-{$mergedTree->id}",
                    'sourceContainerId' => $familyTree->id,
                    'targetContainerId' => $mergedTree->id,
                    'connectionType' => 'merged',
                    'label' => 'Merged Family',
                ];
            }
        }

        return [
            'familyTreeId' => $familyTree->id,
            'familyTreeUuid' => $familyTree->uuid,
            'familyName' => $familyTree->tree_name,
            'mergedGroupName' => $familyTree->merged_group_name,
            'displayName' => $familyTree->getMergedGroupDisplayName(),
            'isMerged' => $isMerged,
            'containers' => $containers,
            'containerConnections' => $containerConnections,
        ];
    }

    /**
     * Build a single family container with tree structure
     *
     * @param int $containerId
     * @param string $containerName
     * @param int $rootUserId
     * @return array
     */
    private function buildFamilyContainer(int $containerId, string $containerName, int $rootUserId): array
    {
        // Use the existing buildFamilyTree method to get nodes and edges
        $treeData = $this->buildFamilyTree($rootUserId);

        return [
            'id' => $containerId,
            'name' => $containerName,
            'rootUserId' => $rootUserId,
            'nodes' => $treeData['nodes'],
            'edges' => $treeData['edges'],
            'spouseGroups' => $treeData['spouseGroups'] ?? [],
            'childSpouseGroups' => $treeData['childSpouseGroups'] ?? [],
            'parentFamilyUnits' => $treeData['parentFamilyUnits'] ?? [],
            'parentConnection' => $treeData['parentConnection'] ?? null,
        ];
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
