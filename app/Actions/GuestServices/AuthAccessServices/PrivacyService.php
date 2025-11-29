<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class PrivacyService
{
    /**
     * Visibility levels
     */
    const VISIBILITY_PUBLIC = 'public';
    const VISIBILITY_CONNECTED = 'connected';
    const VISIBILITY_PRIVATE = 'private';

    public function __construct(
        private UserConnectionRepository $connectionRepository
    ) {}

    /**
     * Check if a user can view a post based on privacy settings
     *
     * Privacy Rules:
     * - 'public': Everyone can see
     * - 'connected': Only direct connections can see
     * - 'private': Only author can see
     *
     * @param Post $post The post to check
     * @param User $viewer The user attempting to view
     * @return bool
     */
    public function canViewPost(Post $post, User $viewer): bool
    {
        // Author can always see their own posts
        if ($post->user_id === $viewer->id) {
            return true;
        }

        $author = $post->user;
        $visibility = $author->stories_visibility ?? self::VISIBILITY_CONNECTED;

        return $this->checkVisibility($author, $viewer, $visibility);
    }

    /**
     * Check if a user can view another user's stories based on visibility setting
     *
     * @param User $author The content author
     * @param User $viewer The user attempting to view
     * @param string $visibility The visibility level (public/connected/private)
     * @return bool
     */
    public function checkVisibility(User $author, User $viewer, string $visibility): bool
    {
        // If viewing own content, always allow
        if ($author->id === $viewer->id) {
            return true;
        }

        // Public content: everyone can see
        if ($visibility === self::VISIBILITY_PUBLIC) {
            return true;
        }

        // Private content: only author can see
        if ($visibility === self::VISIBILITY_PRIVATE) {
            return false;
        }

        // Connected: only direct connections can see
        if ($visibility === self::VISIBILITY_CONNECTED) {
            return $this->areDirectlyConnected($author->id, $viewer->id);
        }

        return false;
    }

    /**
     * Check if two users are directly connected (1st degree)
     *
     * @param int $userId1
     * @param int $userId2
     * @return bool
     */
    public function areDirectlyConnected(int $userId1, int $userId2): bool
    {
        // Get accepted connections between the two users (bidirectional)
        $connections = $this->connectionRepository->getConnections($userId1);

        // Check if userId2 is in the connections
        return $connections->contains(function ($connection) use ($userId2) {
            return $connection->requester_user_id === $userId2 || $connection->recipient_user_id === $userId2;
        });
    }

    /**
     * Get visibility description for display
     *
     * @param string $visibility
     * @return string
     */
    public function getVisibilityDescription(string $visibility): string
    {
        return match($visibility) {
            self::VISIBILITY_PUBLIC => 'Everyone can see',
            self::VISIBILITY_CONNECTED => 'Only connections can see',
            self::VISIBILITY_PRIVATE => 'Only you can see',
            default => 'Unknown',
        };
    }

    /**
     * Get visibility icon class for display
     *
     * @param string $visibility
     * @return string
     */
    public function getVisibilityIcon(string $visibility): string
    {
        return match($visibility) {
            self::VISIBILITY_PUBLIC => 'globe',
            self::VISIBILITY_CONNECTED => 'users',
            self::VISIBILITY_PRIVATE => 'lock',
            default => 'question-circle',
        };
    }

    /**
     * Validate visibility value
     *
     * @param string $visibility
     * @return bool
     */
    public function isValidVisibility(string $visibility): bool
    {
        return in_array($visibility, [
            self::VISIBILITY_PUBLIC,
            self::VISIBILITY_CONNECTED,
            self::VISIBILITY_PRIVATE,
        ]);
    }
}
