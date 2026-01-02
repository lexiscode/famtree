<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Collection;

class ChildAccountRepository
{
    /**
     * Create a new child account
     */
    public function createChildAccount(array $data): User
    {
        return User::create($data);
    }

    /**
     * Get all child accounts for a parent
     */
    public function getChildAccounts(int $parentId): Collection
    {
        return User::where('parent_user_id', $parentId)
            ->where('is_child_account', true)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get a child account by ID
     */
    public function getChildAccount(int $childId): ?User
    {
        return User::where('id', $childId)
            ->where('is_child_account', true)
            ->first();
    }

    /**
     * Check if a user is a parent
     */
    public function isParent(int $userId): bool
    {
        return User::where('parent_user_id', $userId)
            ->where('is_child_account', true)
            ->exists();
    }

    /**
     * Check if a user is a child account
     */
    public function isChildAccount(int $userId): bool
    {
        $user = User::find($userId);
        return $user && $user->is_child_account;
    }

    /**
     * Get parent of a child account
     */
    public function getParent(int $childId): ?User
    {
        $child = User::find($childId);

        if (!$child || !$child->is_child_account) {
            return null;
        }

        return User::find($child->parent_user_id);
    }

    /**
     * Update child account email (when they come of age)
     */
    public function setChildEmail(int $childId, string $email): User
    {
        $child = User::findOrFail($childId);
        $child->email = $email;
        $child->save();
        return $child;
    }

    /**
     * Remove/delete a child account
     */
    public function removeChildAccount(int $childId): bool
    {
        $child = User::find($childId);

        if (!$child) {
            return false;
        }

        // Permanently delete the child user (not soft delete)
        return $child->forceDelete();
    }

    /**
     * Get child count for parent
     */
    public function getChildCount(int $parentId): int
    {
        return User::where('parent_user_id', $parentId)
            ->where('is_child_account', true)
            ->count();
    }

    /**
     * Check if username is available
     */
    public function isUsernameAvailable(string $username): bool
    {
        return !User::where('username', $username)->exists();
    }

    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Update child account details
     */
    public function updateChildAccount(int $childId, array $data): User
    {
        $child = User::findOrFail($childId);
        $child->update($data);
        return $child;
    }
}
