<?php

namespace App\Repositories\GuestRepositories;

use App\Models\UserBlock;

class UserBlockRepository
{
    /**
     * Block a user
     */
    public function block(int $blockerId, int $blockedUserId): UserBlock
    {
        return UserBlock::create([
            'blocker_user_id' => $blockerId,
            'blocked_user_id' => $blockedUserId,
        ]);
    }

    /**
     * Unblock a user
     */
    public function unblock(int $blockerId, int $blockedUserId): bool
    {
        return UserBlock::where('blocker_user_id', $blockerId)
            ->where('blocked_user_id', $blockedUserId)
            ->delete() > 0;
    }

    /**
     * Check if user is blocked
     */
    public function isBlocked(int $blockerId, int $blockedUserId): bool
    {
        return UserBlock::where('blocker_user_id', $blockerId)
            ->where('blocked_user_id', $blockedUserId)
            ->exists();
    }

    /**
     * Get all blocked users for a user
     */
    public function getBlockedUsers(int $userId)
    {
        return UserBlock::where('blocker_user_id', $userId)
            ->with('blockedUser')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get count of blocked users
     */
    public function getBlockedUsersCount(int $userId): int
    {
        return UserBlock::where('blocker_user_id', $userId)->count();
    }

    /**
     * Get users who have blocked this user
     */
    public function getBlockedByUsers(int $userId)
    {
        return UserBlock::where('blocked_user_id', $userId)
            ->with('blocker')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if blocked by a user (reverse lookup)
     */
    public function isBlockedBy(int $userId, int $blockerId): bool
    {
        return UserBlock::where('blocker_user_id', $blockerId)
            ->where('blocked_user_id', $userId)
            ->exists();
    }
}
