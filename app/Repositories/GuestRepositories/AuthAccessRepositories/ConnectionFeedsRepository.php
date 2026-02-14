<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;

class ConnectionFeedsRepository
{
    public function __construct(
        private UserConnectionRepository $connectionRepository
    ) {}

    /**
     * Get all direct connections for a user
     * Direct connections are users with accepted status
     *
     * @param User $user
     * @return Collection
     */
    public function getDirectConnections(User $user): Collection
    {
        $connections = $this->connectionRepository->getConnections($user->id);

        $directUserIds = $connections->map(function ($connection) use ($user) {
            return $connection->requester_user_id === $user->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;
        });

        return User::whereIn('id', $directUserIds)->get();
    }

    /**
     * Get all indirect connections for a user (2nd degree)
     * Indirect connections are friends of friends, excluding direct connections
     *
     * @param User $user
     * @return Collection
     */
    public function getIndirectConnections(User $user): Collection
    {
        // Get direct connections first
        $directConnections = $this->connectionRepository->getConnections($user->id);

        $directUserIds = $directConnections->map(function ($connection) use ($user) {
            return $connection->requester_user_id === $user->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;
        })->toArray();

        // Get connections of each direct connection
        $indirectUserIds = [];

        foreach ($directUserIds as $directUserId) {
            $secondDegreeConnections = $this->connectionRepository->getConnections($directUserId);

            foreach ($secondDegreeConnections as $connection) {
                $connectedUserId = $connection->requester_user_id === $directUserId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;

                // Exclude the original user and direct connections
                if ($connectedUserId !== $user->id && !in_array($connectedUserId, $directUserIds)) {
                    $indirectUserIds[] = $connectedUserId;
                }
            }
        }

        // Remove duplicates and return unique users
        $indirectUserIds = array_unique($indirectUserIds);

        if (empty($indirectUserIds)) {
            return new Collection();
        }

        return User::whereIn('id', $indirectUserIds)->get();
    }

    /**
     * Get all connections (direct + indirect)
     *
     * @param User $user
     * @return Collection
     */
    public function getAllConnections(User $user): Collection
    {
        $direct = $this->getDirectConnections($user);
        $indirect = $this->getIndirectConnections($user);

        // Combine and remove duplicates
        return $direct->merge($indirect)->unique('id');
    }

    /**
     * Get posts from all connections (direct + indirect) from the last X days
     * With eager loading for performance
     *
     * @param User $user
     * @param int $days
     * @return Collection
     */
    public function getConnectionsPosts(User $user, int $days = 30): Collection
    {
        // Get all connection user IDs
        $connections = $this->getAllConnections($user);
        $connectionIds = $connections->pluck('id')->toArray();

        if (empty($connectionIds)) {
            return new Collection();
        }

        // Get posts from last X days with eager loading
        $cutoffDate = Carbon::now()->subDays($days);

        return Post::whereIn('user_id', $connectionIds)
            ->where('created_at', '>=', $cutoffDate)
            ->with([
                'user',
                'images',
                'reactions',
                'comments'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get posts from direct connections only
     *
     * @param User $user
     * @param int $days
     * @return Collection
     */
    public function getDirectConnectionsPosts(User $user, int $days = 30): Collection
    {
        $direct = $this->getDirectConnections($user);
        $directIds = $direct->pluck('id')->toArray();

        if (empty($directIds)) {
            return new Collection();
        }

        $cutoffDate = Carbon::now()->subDays($days);

        return Post::whereIn('user_id', $directIds)
            ->where('created_at', '>=', $cutoffDate)
            ->with([
                'user',
                'images',
                'reactions',
                'comments'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all platform posts from the last X days (no user filter)
     *
     * @param int $days
     * @return Collection
     */
    public function getAllPlatformPosts(int $days = 30): Collection
    {
        $cutoffDate = Carbon::now()->subDays($days);

        return Post::where('created_at', '>=', $cutoffDate)
            ->with([
                'user',
                'images',
                'reactions',
                'comments'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get posts from indirect connections only
     *
     * @param User $user
     * @param int $days
     * @return Collection
     */
    public function getIndirectConnectionsPosts(User $user, int $days = 30): Collection
    {
        $indirect = $this->getIndirectConnections($user);
        $indirectIds = $indirect->pluck('id')->toArray();

        if (empty($indirectIds)) {
            return new Collection();
        }

        $cutoffDate = Carbon::now()->subDays($days);

        return Post::whereIn('user_id', $indirectIds)
            ->where('created_at', '>=', $cutoffDate)
            ->with([
                'user',
                'images',
                'reactions',
                'comments'
            ])
            ->orderBy('created_at', 'desc')
            ->get();
    }
}
