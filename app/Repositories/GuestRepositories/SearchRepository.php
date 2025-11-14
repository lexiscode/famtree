<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\User;
use App\Models\GuestModels\UserConnection;
use Illuminate\Database\Eloquent\Collection;

class SearchRepository
{
    /**
     * Search users by name, username, or email
     *
     * @param string $query
     * @param int $limit
     * @param int|null $excludeUserId - User ID to exclude from results
     * @return Collection
     */
    public function searchUsers(string $query, int $limit = 20, ?int $excludeUserId = null): Collection
    {
        $searchQuery = User::where('is_child_account', false)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', '%' . $query . '%')
                    ->orWhere('last_name', 'like', '%' . $query . '%')
                    ->orWhere('username', 'like', '%' . $query . '%')
                    ->orWhere('email', 'like', '%' . $query . '%');
            });

        // Exclude the current user from results
        if ($excludeUserId) {
            $searchQuery->where('id', '!=', $excludeUserId);
        }

        return $searchQuery->limit($limit)->get();
    }

    /**
     * Search users with mutual connections count
     *
     * @param string $query
     * @param int $currentUserId
     * @param int $limit
     * @return Collection
     */
    public function searchUsersWithMutualConnections(string $query, int $currentUserId, int $limit = 20): Collection
    {
        return User::where('is_child_account', false)
            ->where('id', '!=', $currentUserId)
            ->where(function ($q) use ($query) {
                $q->where('first_name', 'like', '%' . $query . '%')
                    ->orWhere('last_name', 'like', '%' . $query . '%')
                    ->orWhere('username', 'like', '%' . $query . '%')
                    ->orWhere('email', 'like', '%' . $query . '%');
            })
            ->withCount([
                'connectionsAsRequester' => function ($q) use ($currentUserId) {
                    $q->where('recipient_user_id', $currentUserId)
                        ->where('status', 'accepted');
                },
                'connectionsAsRecipient' => function ($q) use ($currentUserId) {
                    $q->where('requester_user_id', $currentUserId)
                        ->where('status', 'accepted');
                },
            ])
            ->limit($limit)
            ->get();
    }

    /**
     * Get connection status between two users
     *
     * @param int $userId
     * @param int $otherUserId
     * @return string - 'connected', 'pending', 'sent', 'none'
     */
    public function getConnectionStatus(int $userId, int $otherUserId): string
    {
        // Check if already connected (both directions)
        $connection = UserConnection::where(function ($q) use ($userId, $otherUserId) {
            $q->where('requester_user_id', $userId)
                ->where('recipient_user_id', $otherUserId);
        })->orWhere(function ($q) use ($userId, $otherUserId) {
            $q->where('requester_user_id', $otherUserId)
                ->where('recipient_user_id', $userId);
        })->first();

        if (!$connection) {
            return 'none';
        }

        if ($connection->status === 'accepted') {
            return 'connected';
        }

        if ($connection->requester_user_id === $userId) {
            return 'sent';
        }

        return 'pending';
    }

    /**
     * Search users by specific criteria
     *
     * @param array $criteria - ['name' => '', 'username' => '', 'email' => '']
     * @param int $limit
     * @return Collection
     */
    public function searchByCriteria(array $criteria, int $limit = 20): Collection
    {
        $query = User::where('is_child_account', false);

        foreach ($criteria as $field => $value) {
            if ($value) {
                $query->where($field, 'like', '%' . $value . '%');
            }
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get popular/featured users (most connections)
     *
     * @param int $limit
     * @return Collection
     */
    public function getFeaturedUsers(int $limit = 10): Collection
    {
        return User::where('is_child_account', false)
            ->withCount('connectionsAsRequester')
            ->withCount('connectionsAsRecipient')
            ->orderByRaw('(connections_as_requester_count + connections_as_recipient_count) DESC')
            ->limit($limit)
            ->get();
    }

    /**
     * Suggest users based on mutual connections
     *
     * @param int $userId
     * @param int $limit
     * @return Collection
     */
    public function getSuggestedUsers(int $userId, int $limit = 5): Collection
    {
        // Get users who are connected to people the current user is connected to
        return User::where('id', '!=', $userId)
            ->where('is_child_account', false)
            ->whereHas('connectionsAsRequester', function ($q) use ($userId) {
                $q->where('status', 'accepted')
                    ->whereIn('recipient_user_id',
                        UserConnection::where('requester_user_id', $userId)
                            ->where('status', 'accepted')
                            ->pluck('recipient_user_id')
                    );
            })
            ->orWhere(function ($q) use ($userId) {
                $q->where('id', '!=', $userId)
                    ->where('is_child_account', false)
                    ->whereHas('connectionsAsRecipient', function ($query) use ($userId) {
                        $query->where('status', 'accepted')
                            ->whereIn('requester_user_id',
                                UserConnection::where('requester_user_id', $userId)
                                    ->where('status', 'accepted')
                                    ->pluck('recipient_user_id')
                            );
                    });
            })
            ->limit($limit)
            ->get();
    }
}
