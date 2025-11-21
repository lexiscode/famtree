<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\UserBlockRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class UserBlockService
{
    public function __construct(
        private UserBlockRepository $blockRepository,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Block a user
     */
    public function blockUser(User $blocker, string $username): array
    {
        // Find the user to block
        $userToBlock = User::where('username', $username)->firstOrFail();

        // Cannot block yourself
        if ($blocker->id === $userToBlock->id) {
            throw new \Exception('You cannot block yourself.');
        }

        // Check if already blocked
        if ($this->blockRepository->isBlocked($blocker->id, $userToBlock->id)) {
            throw new \Exception('You have already blocked this user.');
        }

        // Block the user
        $block = $this->blockRepository->block($blocker->id, $userToBlock->id);

        // Delete any connections between blocker and blocked user
        $this->connectionRepository->deleteConnectionBetween($blocker->id, $userToBlock->id);

        return [
            'success' => true,
            'message' => '@' . $username . ' has been blocked.',
            'block_id' => $block->id,
        ];
    }

    /**
     * Unblock a user
     */
    public function unblockUser(User $blocker, int $blockedUserId): array
    {
        $success = $this->blockRepository->unblock($blocker->id, $blockedUserId);

        if (!$success) {
            throw new \Exception('User is not blocked or not found.');
        }

        // Get blocked user info for response
        $blockedUser = User::findOrFail($blockedUserId);

        return [
            'success' => true,
            'message' => '@' . $blockedUser->username . ' has been unblocked.',
        ];
    }

    /**
     * Get user's blocked users list
     */
    public function getBlockedUsers(User $user): array
    {
        $blocks = $this->blockRepository->getBlockedUsers($user->id);

        return $blocks->map(fn($block) => [
            'id' => $block->blockedUser->id,
            'first_name' => $block->blockedUser->first_name,
            'last_name' => $block->blockedUser->last_name,
            'full_name' => $block->blockedUser->first_name . ' ' . $block->blockedUser->last_name,
            'username' => $block->blockedUser->username,
            'profile_image_url' => $block->blockedUser->profile_image_url,
            'blocked_at' => $block->created_at,
        ])->toArray();
    }

    /**
     * Check if user has blocked another user
     */
    public function hasBlocked(User $blocker, int $blockedUserId): bool
    {
        return $this->blockRepository->isBlocked($blocker->id, $blockedUserId);
    }

    /**
     * Check if user is blocked by another user
     */
    public function isBlockedBy(User $user, int $blockerId): bool
    {
        return $this->blockRepository->isBlockedBy($user->id, $blockerId);
    }
}
