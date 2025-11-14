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
}
