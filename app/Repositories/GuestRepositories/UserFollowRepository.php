<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\UserFollow;
use App\Models\GuestModels\User;
use App\Models\OrgModels\OrganizationFollow;

class UserFollowRepository
{
    /**
     * Create a follow relationship
     */
    public function follow(int $followerId, int $followingId): UserFollow
    {
        return UserFollow::create([
            'follower_user_id' => $followerId,
            'following_user_id' => $followingId,
        ]);
    }

    /**
     * Remove a follow relationship
     */
    public function unfollow(int $followerId, int $followingId): bool
    {
        return UserFollow::where('follower_user_id', $followerId)
            ->where('following_user_id', $followingId)
            ->delete() > 0;
    }

    /**
     * Check if a user is following another user
     */
    public function isFollowing(int $followerId, int $followingId): bool
    {
        return UserFollow::where('follower_user_id', $followerId)
            ->where('following_user_id', $followingId)
            ->exists();
    }

    /**
     * Get list of users following this user (followers)
     */
    public function getFollowers(int $userId)
    {
        return UserFollow::where('following_user_id', $userId)
            ->with('follower')
            ->orderBy('created_at', 'desc')
            ->get()
            ->pluck('follower');
    }

    /**
     * Get list of users this user is following
     */
    public function getFollowing(int $userId)
    {
        return UserFollow::where('follower_user_id', $userId)
            ->with('following')
            ->orderBy('created_at', 'desc')
            ->get()
            ->pluck('following');
    }

    /**
     * Count followers for a user
     */
    public function getFollowerCount(int $userId): int
    {
        return UserFollow::where('following_user_id', $userId)->count();
    }

    /**
     * Count users and organizations this user is following
     */
    public function getFollowingCount(int $userId): int
    {
        $userFollows = UserFollow::where('follower_user_id', $userId)->count();
        $orgFollows = OrganizationFollow::where('user_id', $userId)->count();

        return $userFollows + $orgFollows;
    }

    /**
     * Get mutual follows between two users
     */
    public function getMutualFollows(int $userId1, int $userId2)
    {
        // Get all users that userId1 is following
        $user1Following = UserFollow::where('follower_user_id', $userId1)
            ->pluck('following_user_id')
            ->toArray();

        // Get all users that userId2 is following
        $user2Following = UserFollow::where('follower_user_id', $userId2)
            ->pluck('following_user_id')
            ->toArray();

        // Find intersection (mutual follows)
        $mutualIds = array_intersect($user1Following, $user2Following);

        return User::whereIn('id', $mutualIds)->get();
    }

    /**
     * Get follow relationship status between two users
     */
    public function getFollowRelationship(int $viewerId, int $targetUserId): array
    {
        return [
            'is_following' => $this->isFollowing($viewerId, $targetUserId),
            'is_followed_by' => $this->isFollowing($targetUserId, $viewerId),
        ];
    }

    /**
     * Get paginated followers for a user
     */
    public function getFollowersPaginated(int $userId, int $perPage = 20)
    {
        return UserFollow::where('following_user_id', $userId)
            ->with('follower')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get paginated following for a user
     */
    public function getFollowingPaginated(int $userId, int $perPage = 20)
    {
        return UserFollow::where('follower_user_id', $userId)
            ->with('following')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
