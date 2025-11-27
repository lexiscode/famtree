<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\User;
use App\Models\UserBlock;
use Illuminate\Database\Eloquent\Collection;

class SuggestedConnectionRepository
{
    /**
     * Get all direct connections for a user
     */
    public function getDirectConnections(int $userId): Collection
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->with(['requester', 'recipient'])
            ->get();
    }

    /**
     * Get second-degree connections (connections of connections)
     * Returns users who are connected to the user's direct connections
     * but are not directly connected to the user themselves
     */
    public function getSecondDegreeConnections(int $userId): Collection
    {
        // Get all direct connection IDs
        $directConnections = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->get()
            ->map(function ($connection) use ($userId) {
                return $connection->requester_user_id === $userId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;
            })
            ->toArray();

        // If no direct connections, return empty
        if (empty($directConnections)) {
            return new Collection();
        }

        // Get all users connected to the user's direct connections
        $secondDegreeUserIds = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($directConnections) {
                $q->whereIn('requester_user_id', $directConnections)
                  ->orWhereIn('recipient_user_id', $directConnections);
            })
            ->get()
            ->map(function ($connection) use ($directConnections, $userId) {
                // Get the other user in the connection
                if (in_array($connection->requester_user_id, $directConnections)) {
                    return $connection->recipient_user_id;
                } else {
                    return $connection->requester_user_id;
                }
            })
            ->filter(function ($id) use ($userId, $directConnections) {
                // Exclude the user themselves and their direct connections
                return $id !== $userId && !in_array($id, $directConnections);
            })
            ->unique()
            ->toArray();

        // Get the user models for second-degree connections
        return User::whereIn('id', $secondDegreeUserIds)->get();
    }

    /**
     * Get all users that the given user is already connected to (for filtering)
     */
    public function getConnectedUserIds(int $userId): array
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->get()
            ->map(function ($connection) use ($userId) {
                return $connection->requester_user_id === $userId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;
            })
            ->toArray();
    }

    /**
     * Get all pending requests (both sent and received) for the user
     */
    public function getPendingRequestUserIds(int $userId): array
    {
        return UserConnection::where('status', 'pending')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->get()
            ->map(function ($connection) use ($userId) {
                return $connection->requester_user_id === $userId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;
            })
            ->toArray();
    }

    /**
     * Get users that have blocked the given user or have been blocked by them
     */
    public function getBlockedUserIds(int $userId): array
    {
        return UserBlock::where(function ($q) use ($userId) {
                $q->where('blocker_user_id', $userId)
                  ->orWhere('blocked_user_id', $userId);
            })
            ->pluck('blocked_user_id')
            ->merge(
                UserBlock::where(function ($q) use ($userId) {
                    $q->where('blocker_user_id', $userId)
                      ->orWhere('blocked_user_id', $userId);
                })
                ->pluck('blocker_user_id')
            )
            ->unique()
            ->toArray();
    }

    /**
     * Get the connection path between two users (for inference)
     * Returns the connection records that link the two users
     */
    public function getConnectionPath(int $userId1, int $userId2): ?array
    {
        // First try direct connection
        $direct = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId1, $userId2) {
                $q->where(function ($q) use ($userId1, $userId2) {
                    $q->where('requester_user_id', $userId1)
                      ->where('recipient_user_id', $userId2);
                })
                ->orWhere(function ($q) use ($userId1, $userId2) {
                    $q->where('requester_user_id', $userId2)
                      ->where('recipient_user_id', $userId1);
                });
            })
            ->first();

        if ($direct) {
            return ['path' => [$direct], 'length' => 1];
        }

        // Find second-degree path
        $directConnections = $this->getDirectConnections($userId1);

        foreach ($directConnections as $connection) {
            $connectedUserId = $connection->requester_user_id === $userId1
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            // Find connection from intermediate user to target user
            $secondConnection = UserConnection::where('status', 'accepted')
                ->where(function ($q) use ($connectedUserId, $userId2) {
                    $q->where(function ($q) use ($connectedUserId, $userId2) {
                        $q->where('requester_user_id', $connectedUserId)
                          ->where('recipient_user_id', $userId2);
                    })
                    ->orWhere(function ($q) use ($connectedUserId, $userId2) {
                        $q->where('requester_user_id', $userId2)
                          ->where('recipient_user_id', $connectedUserId);
                    });
                })
                ->first();

            if ($secondConnection) {
                return [
                    'path' => [$connection, $secondConnection],
                    'intermediate_user_id' => $connectedUserId,
                    'length' => 2
                ];
            }
        }

        return null;
    }

    /**
     * Get all connections for a specific user with their relationship types
     */
    public function getUserConnectionsWithTypes(int $userId): Collection
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->with(['requester', 'recipient'])
            ->get();
    }
}
