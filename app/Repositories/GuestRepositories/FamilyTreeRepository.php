<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\FamilyTree;
use App\Models\GuestModels\FamilyTreeMember;
use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Collection;

class FamilyTreeRepository
{
    /**
     * Create a new family tree
     */
    public function create(array $data): FamilyTree
    {
        return FamilyTree::create($data);
    }

    /**
     * Get a family tree by ID with all relationships
     */
    public function getTree(int $treeId): ?FamilyTree
    {
        return FamilyTree::with('rootUser', 'createdBy', 'members.user')
            ->findOrFail($treeId);
    }

    /**
     * Get all family trees for a user
     */
    public function getUserTrees(int $userId): Collection
    {
        return FamilyTree::where('root_user_id', $userId)
            ->orWhere('created_by_user_id', $userId)
            ->with('rootUser', 'createdBy')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get family trees a user is a member of
     */
    public function getUserMemberTrees(int $userId): Collection
    {
        return FamilyTree::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with('rootUser', 'createdBy')
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Add a user to a family tree
     */
    public function addMember(int $treeId, int $userId, int $addedByUserId): FamilyTreeMember
    {
        return FamilyTreeMember::create([
            'family_tree_id' => $treeId,
            'user_id' => $userId,
            'added_by_user_id' => $addedByUserId,
            'added_at' => now(),
        ]);
    }

    /**
     * Remove a user from a family tree
     */
    public function removeMember(int $treeId, int $userId): bool
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    /**
     * Get all members of a family tree
     */
    public function getTreeMembers(int $treeId): Collection
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->with('user', 'addedBy')
            ->orderBy('added_at', 'desc')
            ->get();
    }

    /**
     * Get paginated tree members
     */
    public function getTreeMembersPaginated(int $treeId, int $perPage = 12)
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->with('user', 'addedBy')
            ->orderBy('added_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Check if a user is a member of a tree
     */
    public function isMember(int $treeId, int $userId): bool
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Update a family tree
     */
    public function update(int $treeId, array $data): FamilyTree
    {
        $tree = FamilyTree::findOrFail($treeId);
        $tree->update($data);
        return $tree;
    }

    /**
     * Delete a family tree
     */
    public function delete(int $treeId): bool
    {
        return FamilyTree::destroy($treeId) > 0;
    }

    /**
     * Get public family trees
     */
    public function getPublicTrees(int $limit = 20): Collection
    {
        return FamilyTree::where('is_public', true)
            ->with('rootUser', 'createdBy')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get member count for a tree
     */
    public function getMemberCount(int $treeId): int
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)->count();
    }

    /**
     * Check if user owns the tree
     */
    public function isOwner(int $treeId, int $userId): bool
    {
        return FamilyTree::where('id', $treeId)
            ->where('created_by_user_id', $userId)
            ->exists();
    }

    /**
     * Get trees where user is an admin (excluding merged trees)
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserAdminTrees(int $userId): Collection
    {
        return FamilyTree::whereHas('admins', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->whereNull('merged_into_tree_id')
        ->with(['rootUser', 'createdBy', 'admins.user'])
        ->orderBy('created_at', 'desc')
        ->get();
    }

    /**
     * Get nuclear family members only (spouse and children)
     *
     * @param int $treeId
     * @return Collection
     */
    public function getNuclearFamilyMembers(int $treeId): Collection
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->whereIn('nuclear_family_role', ['spouse', 'child'])
            ->with('user', 'addedBy')
            ->orderBy('added_at', 'desc')
            ->get();
    }

    /**
     * Mark a tree as merged into another tree
     *
     * @param int $treeId
     * @param int $mergedIntoTreeId
     * @return FamilyTree
     */
    public function markAsMerged(int $treeId, int $mergedIntoTreeId): FamilyTree
    {
        $tree = FamilyTree::findOrFail($treeId);
        $tree->update([
            'merged_into_tree_id' => $mergedIntoTreeId,
            'merged_at' => now(),
        ]);

        // Soft delete the merged tree
        $tree->delete();

        return $tree;
    }

    /**
     * Add a tree ID to the merged_tree_ids array
     *
     * @param int $treeId
     * @param int $mergedTreeId
     * @return FamilyTree
     */
    public function addMergedTreeId(int $treeId, int $mergedTreeId): FamilyTree
    {
        $tree = FamilyTree::findOrFail($treeId);
        $mergedTreeIds = $tree->merged_tree_ids ?? [];

        if (!in_array($mergedTreeId, $mergedTreeIds)) {
            $mergedTreeIds[] = $mergedTreeId;
            $tree->update(['merged_tree_ids' => $mergedTreeIds]);
        }

        return $tree->fresh();
    }

    /**
     * Add a member with nuclear family role and permissions
     *
     * @param int $treeId
     * @param int $userId
     * @param int $addedByUserId
     * @param string|null $nuclearFamilyRole
     * @param bool $canAddMembers
     * @return FamilyTreeMember
     */
    public function addMemberWithRole(
        int $treeId,
        int $userId,
        int $addedByUserId,
        ?string $nuclearFamilyRole = null,
        bool $canAddMembers = false
    ): FamilyTreeMember {
        return FamilyTreeMember::create([
            'family_tree_id' => $treeId,
            'user_id' => $userId,
            'added_by_user_id' => $addedByUserId,
            'added_at' => now(),
            'nuclear_family_role' => $nuclearFamilyRole,
            'can_add_members' => $canAddMembers,
        ]);
    }

    /**
     * Get a member entry for a specific user in a tree
     *
     * @param int $treeId
     * @param int $userId
     * @return FamilyTreeMember|null
     */
    public function getMemberEntry(int $treeId, int $userId): ?FamilyTreeMember
    {
        return FamilyTreeMember::where('family_tree_id', $treeId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Get all non-merged trees
     *
     * @return Collection
     */
    public function getActiveTrees(): Collection
    {
        return FamilyTree::whereNull('merged_into_tree_id')
            ->with(['rootUser', 'createdBy', 'admins.user'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a family tree by ID including soft-deleted (merged) trees
     *
     * @param int $treeId
     * @return FamilyTree|null
     */
    public function getTreeWithTrashed(int $treeId): ?FamilyTree
    {
        return FamilyTree::withTrashed()
            ->with('rootUser', 'createdBy')
            ->find($treeId);
    }

    /**
     * Get merged trees for a parent tree
     *
     * @param array $mergedTreeIds
     * @return Collection
     */
    public function getMergedTrees(array $mergedTreeIds): Collection
    {
        return FamilyTree::withTrashed()
            ->whereIn('id', $mergedTreeIds)
            ->with('rootUser', 'createdBy')
            ->get();
    }

    /**
     * Update the merged group name for a family tree
     *
     * @param int $treeId
     * @param string $mergedGroupName
     * @return FamilyTree
     */
    public function updateMergedGroupName(int $treeId, string $mergedGroupName): FamilyTree
    {
        $tree = FamilyTree::findOrFail($treeId);
        $tree->update(['merged_group_name' => $mergedGroupName]);
        return $tree->fresh();
    }

    /**
     * Find the user's original tree within a merged family tree
     * Returns the tree the user originally belonged to (before merge)
     *
     * @param FamilyTree $parentTree The main merged tree
     * @param int $userId
     * @return FamilyTree|null The user's original tree (could be parent or a merged tree)
     */
    public function getUserOriginalTree(FamilyTree $parentTree, int $userId): ?FamilyTree
    {
        // First check if user is in the parent tree with a non-merged role
        $memberEntry = FamilyTreeMember::where('family_tree_id', $parentTree->id)
            ->where('user_id', $userId)
            ->first();

        if ($memberEntry) {
            // If the user's role is not 'merged', they belong to the parent tree
            if ($memberEntry->nuclear_family_role !== 'merged') {
                return $parentTree;
            }

            // User has 'merged' role - they came from a merged tree
            // Check which merged tree they originally belonged to
            $mergedTreeIds = $parentTree->merged_tree_ids ?? [];

            foreach ($mergedTreeIds as $mergedTreeId) {
                $mergedTree = FamilyTree::withTrashed()->find($mergedTreeId);
                if ($mergedTree) {
                    // Check if user was the root user or creator of this merged tree
                    if ($mergedTree->root_user_id === $userId || $mergedTree->created_by_user_id === $userId) {
                        return $mergedTree;
                    }

                    // Check if user was a member of this tree before it was merged
                    // We can check by looking at the original member entries
                    $wasMember = FamilyTreeMember::withTrashed()
                        ->where('family_tree_id', $mergedTreeId)
                        ->where('user_id', $userId)
                        ->exists();

                    if ($wasMember) {
                        return $mergedTree;
                    }
                }
            }
        }

        // Check if user is an admin of the parent tree
        $isAdmin = $parentTree->admins()->where('user_id', $userId)->exists();
        if ($isAdmin) {
            // Check if they're a co_admin (came from merged tree) or creator
            $adminEntry = $parentTree->admins()->where('user_id', $userId)->first();
            if ($adminEntry && $adminEntry->role === 'creator') {
                return $parentTree;
            }

            // Co-admin - find their original tree
            $mergedTreeIds = $parentTree->merged_tree_ids ?? [];
            foreach ($mergedTreeIds as $mergedTreeId) {
                $mergedTree = FamilyTree::withTrashed()->find($mergedTreeId);
                if ($mergedTree && ($mergedTree->root_user_id === $userId || $mergedTree->created_by_user_id === $userId)) {
                    return $mergedTree;
                }
            }
        }

        // Default to parent tree if we can't determine
        return $parentTree;
    }
}
