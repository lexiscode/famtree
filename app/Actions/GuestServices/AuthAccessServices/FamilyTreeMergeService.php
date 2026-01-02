<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeConnectionRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class FamilyTreeMergeService
{
    public function __construct(
        private FamilyTreeRepository $familyTreeRepository,
        private FamilyTreeAdminRepository $familyTreeAdminRepository,
        private FamilyTreeConnectionRepository $familyTreeConnectionRepository
    ) {}

    /**
     * Merge two family trees together
     *
     * Process:
     * 1. Accept the connection request
     * 2. Copy all members from tree2 to tree1 with 'merged' role
     * 3. Make tree2's creator a co-admin of tree1
     * 4. Add tree2's ID to tree1's merged_tree_ids array
     * 5. Mark tree2 as merged into tree1
     * 6. Soft delete tree2
     *
     * @param int $connectionId
     * @param int $acceptedByUserId
     * @return array ['success' => bool, 'merged_tree_id' => int, 'members_copied' => int, 'message' => string]
     * @throws Exception
     */
    public function mergeTrees(int $connectionId, int $acceptedByUserId): array
    {
        try {
            return DB::transaction(function () use ($connectionId, $acceptedByUserId) {
                // Step 1: Get the connection request
                $connection = $this->familyTreeConnectionRepository->find($connectionId);

                if (!$connection->isPending()) {
                    throw new Exception('Connection request has already been processed.');
                }

                $requesterTreeId = $connection->requester_tree_id;
                $recipientTreeId = $connection->recipient_tree_id;

                // For consistency, always merge into the requester's tree (tree1)
                $tree1Id = $requesterTreeId;
                $tree2Id = $recipientTreeId;

                // Get both trees
                $tree1 = $this->familyTreeRepository->getTree($tree1Id);
                $tree2 = $this->familyTreeRepository->getTree($tree2Id);

                if (!$tree1 || !$tree2) {
                    throw new Exception('One or both trees not found.');
                }

                if ($tree1->isMerged() || $tree2->isMerged()) {
                    throw new Exception('One or both trees have already been merged.');
                }

                // Step 2: Accept the connection request
                $this->familyTreeConnectionRepository->acceptRequest($connectionId, $acceptedByUserId);

                // Step 3: Copy all members from tree2 to tree1 with 'merged' role
                $tree2Members = $this->familyTreeRepository->getTreeMembers($tree2Id);
                $membersCopied = 0;

                foreach ($tree2Members as $member) {
                    // Check if member already exists in tree1
                    if (!$this->familyTreeRepository->isMember($tree1Id, $member->user_id)) {
                        $this->familyTreeRepository->addMemberWithRole(
                            treeId: $tree1Id,
                            userId: $member->user_id,
                            addedByUserId: $acceptedByUserId,
                            nuclearFamilyRole: 'merged',
                            canAddMembers: false
                        );
                        $membersCopied++;
                    }
                }

                // Step 4: Get tree2's creator admin
                $tree2CreatorAdmin = $this->familyTreeAdminRepository->getCreator($tree2Id);

                if ($tree2CreatorAdmin) {
                    // Make tree2's creator a co-admin of tree1 (if not already a member)
                    if (!$this->familyTreeAdminRepository->isAdmin($tree1Id, $tree2CreatorAdmin->user_id)) {
                        $this->familyTreeAdminRepository->create(
                            familyTreeId: $tree1Id,
                            userId: $tree2CreatorAdmin->user_id,
                            role: 'co_admin',
                            grantedByUserId: $acceptedByUserId
                        );

                        // Also add them as a member with full permissions
                        if (!$this->familyTreeRepository->isMember($tree1Id, $tree2CreatorAdmin->user_id)) {
                            $this->familyTreeRepository->addMemberWithRole(
                                treeId: $tree1Id,
                                userId: $tree2CreatorAdmin->user_id,
                                addedByUserId: $acceptedByUserId,
                                nuclearFamilyRole: 'merged',
                                canAddMembers: true
                            );
                            $membersCopied++;
                        }
                    }
                }

                // Step 5: Add tree2's ID to tree1's merged_tree_ids array
                $this->familyTreeRepository->addMergedTreeId($tree1Id, $tree2Id);

                // Step 6: Mark tree2 as merged into tree1 and soft delete it
                $this->familyTreeRepository->markAsMerged($tree2Id, $tree1Id);

                Log::info('Family trees merged successfully', [
                    'connection_id' => $connectionId,
                    'tree1_id' => $tree1Id,
                    'tree2_id' => $tree2Id,
                    'members_copied' => $membersCopied,
                    'accepted_by_user_id' => $acceptedByUserId,
                ]);

                return [
                    'success' => true,
                    'merged_tree_id' => $tree1Id,
                    'members_copied' => $membersCopied,
                    'message' => "Successfully merged {$tree2->tree_name} into {$tree1->tree_name}. {$membersCopied} members were added.",
                ];
            });
        } catch (Exception $e) {
            Log::error('Failed to merge family trees', [
                'connection_id' => $connectionId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return [
                'success' => false,
                'merged_tree_id' => null,
                'members_copied' => 0,
                'message' => 'Failed to merge trees: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Validate if two trees can be merged
     *
     * @param int $tree1Id
     * @param int $tree2Id
     * @return array ['can_merge' => bool, 'errors' => array]
     */
    public function canMergeTrees(int $tree1Id, int $tree2Id): array
    {
        $errors = [];

        try {
            $tree1 = $this->familyTreeRepository->getTree($tree1Id);
            $tree2 = $this->familyTreeRepository->getTree($tree2Id);

            if (!$tree1 || !$tree2) {
                $errors[] = 'One or both trees not found.';
                return ['can_merge' => false, 'errors' => $errors];
            }

            if ($tree1->isMerged()) {
                $errors[] = "{$tree1->tree_name} has already been merged into another tree.";
            }

            if ($tree2->isMerged()) {
                $errors[] = "{$tree2->tree_name} has already been merged into another tree.";
            }

            // Check if connection request exists
            $connection = $this->familyTreeConnectionRepository->getConnectionBetweenTrees($tree1Id, $tree2Id);
            if (!$connection) {
                $errors[] = 'No connection request exists between these trees.';
            }
        } catch (Exception $e) {
            $errors[] = 'Error validating trees: ' . $e->getMessage();
        }

        return [
            'can_merge' => count($errors) === 0,
            'errors' => $errors,
        ];
    }
}
