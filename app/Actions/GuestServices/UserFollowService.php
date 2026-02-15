<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\UserFollowRepository;
use App\Actions\GuestServices\NotificationService;

class UserFollowService
{
    public function __construct(
        private UserFollowRepository $followRepository,
        private NotificationService $notificationService,
    ) {}

    /**
     * Follow a user
     */
    public function followUser(User $follower, int $followingId)
    {
        // Validate: Cannot follow yourself
        if ($follower->id === $followingId) {
            throw new \Exception('You cannot follow yourself');
        }

        // Validate: User exists
        $followingUser = User::findOrFail($followingId);

        // Validate: Not already following
        if ($this->followRepository->isFollowing($follower->id, $followingId)) {
            throw new \Exception('You are already following this user');
        }

        // Create follow relationship
        $follow = $this->followRepository->follow($follower->id, $followingId);

        // Send notification to the followed user
        $this->notificationService->sendFollowNotification($follower->id, $followingId);

        return $follow;
    }

    /**
     * Unfollow a user
     */
    public function unfollowUser(User $follower, int $followingId)
    {
        // Validate: Currently following
        if (!$this->followRepository->isFollowing($follower->id, $followingId)) {
            throw new \Exception('You are not following this user');
        }

        // Remove follow relationship
        return $this->followRepository->unfollow($follower->id, $followingId);
    }

    /**
     * Get follow status between viewer and target user
     */
    public function getFollowStatus(int $viewerId, int $targetUserId): array
    {
        $relationship = $this->followRepository->getFollowRelationship($viewerId, $targetUserId);

        return [
            'is_following' => $relationship['is_following'],
            'is_followed_by' => $relationship['is_followed_by'],
            'follower_count' => $this->followRepository->getFollowerCount($targetUserId),
            'following_count' => $this->followRepository->getFollowingCount($targetUserId),
        ];
    }

    /**
     * Get formatted followers list for a user
     */
    public function getFollowersList(int $userId, int $viewerId)
    {
        $followers = $this->followRepository->getFollowers($userId);

        return $followers->map(function ($follower) use ($viewerId) {
            $relationship = $this->followRepository->getFollowRelationship($viewerId, $follower->id);

            return [
                'id' => $follower->id,
                'uuid' => $follower->uuid,
                'first_name' => $follower->first_name,
                'last_name' => $follower->last_name,
                'name' => trim($follower->first_name . ' ' . $follower->last_name),
                'username' => $follower->username,
                'profile_image_url' => $follower->profile_image_url,
                'bio' => $follower->bio,
                'is_following' => $relationship['is_following'],
                'is_followed_by' => $relationship['is_followed_by'],
                'is_mutual' => $relationship['is_following'] && $relationship['is_followed_by'],
            ];
        });
    }

    /**
     * Get formatted following list for a user
     */
    public function getFollowingList(int $userId, int $viewerId)
    {
        $following = $this->followRepository->getFollowing($userId);

        return $following->map(function ($user) use ($viewerId) {
            $relationship = $this->followRepository->getFollowRelationship($viewerId, $user->id);

            return [
                'id' => $user->id,
                'uuid' => $user->uuid,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
                'bio' => $user->bio,
                'is_following' => $relationship['is_following'],
                'is_followed_by' => $relationship['is_followed_by'],
                'is_mutual' => $relationship['is_following'] && $relationship['is_followed_by'],
            ];
        });
    }

    /**
     * Get mutual follows between two users
     */
    public function getMutualFollows(int $userId1, int $userId2)
    {
        return $this->followRepository->getMutualFollows($userId1, $userId2);
    }
}
