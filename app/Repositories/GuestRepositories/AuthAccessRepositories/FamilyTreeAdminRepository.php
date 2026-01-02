<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\FamilyTreeAdmin;
use App\Models\GuestModels\FamilyTree;
use Illuminate\Database\Eloquent\Collection;

class FamilyTreeAdminRepository
{
    /**
     * Create a new admin entry for a tree
     *
     * @param int $familyTreeId
     * @param int $userId
     * @param string $role 'creator' or 'co_admin'
     * @param int|null $grantedByUserId
     * @return FamilyTreeAdmin
     */
    public function create(int $familyTreeId, int $userId, string $role = 'co_admin', ?int $grantedByUserId = null): FamilyTreeAdmin
    {
        return FamilyTreeAdmin::create([
            'family_tree_id' => $familyTreeId,
            'user_id' => $userId,
            'role' => $role,
            'granted_at' => now(),
            'granted_by_user_id' => $grantedByUserId,
        ]);
    }

    /**
     * Get all admins for a given tree
     *
     * @param int $familyTreeId
     * @return Collection
     */
    public function getTreeAdmins(int $familyTreeId): Collection
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->with('user')
            ->get();
    }

    /**
     * Check if a user is an admin of a given tree
     *
     * @param int $familyTreeId
     * @param int $userId
     * @return bool
     */
    public function isAdmin(int $familyTreeId, int $userId): bool
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Remove an admin from a tree
     *
     * @param int $familyTreeId
     * @param int $userId
     * @return bool
     */
    public function removeAdmin(int $familyTreeId, int $userId): bool
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Get all trees where the user is an admin (not merged trees)
     *
     * @param int $userId
     * @return Collection
     */
    public function getUserAdminTrees(int $userId): Collection
    {
        return FamilyTreeAdmin::where('user_id', $userId)
            ->whereHas('familyTree', function ($query) {
                $query->whereNull('merged_into_tree_id');
            })
            ->with('familyTree')
            ->get()
            ->pluck('familyTree');
    }

    /**
     * Get the creator admin for a given tree
     *
     * @param int $familyTreeId
     * @return FamilyTreeAdmin|null
     */
    public function getCreator(int $familyTreeId): ?FamilyTreeAdmin
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->where('role', 'creator')
            ->with('user')
            ->first();
    }

    /**
     * Get admin entry for a specific user and tree
     *
     * @param int $familyTreeId
     * @param int $userId
     * @return FamilyTreeAdmin|null
     */
    public function getAdminEntry(int $familyTreeId, int $userId): ?FamilyTreeAdmin
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Check if a user is the creator of a tree
     *
     * @param int $familyTreeId
     * @param int $userId
     * @return bool
     */
    public function isCreator(int $familyTreeId, int $userId): bool
    {
        return FamilyTreeAdmin::where('family_tree_id', $familyTreeId)
            ->where('user_id', $userId)
            ->where('role', 'creator')
            ->exists();
    }
}
