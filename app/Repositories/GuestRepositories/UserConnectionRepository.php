<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\User;
use Carbon\Carbon;

class UserConnectionRepository
{
    /**
     * Send a connection request
     */
    public function sendRequest(int $requesterId, int $recipientId, string $relationshipType): UserConnection
    {
        return UserConnection::create([
            'requester_user_id' => $requesterId,
            'recipient_user_id' => $recipientId,
            'relationship_type' => $relationshipType,
            'status' => 'pending',
            'requested_at' => now(),
        ]);
    }

    /**
     * Accept a connection request
     */
    public function acceptRequest(int $connectionId): UserConnection
    {
        $connection = UserConnection::findOrFail($connectionId);
        $connection->update([
            'status' => 'accepted',
            'accepted_at' => now(),
            'expires_at' => now()->addHours(24), // 24h undo window
        ]);

        return $connection;
    }

    /**
     * Decline a connection request
     */
    public function declineRequest(int $connectionId): UserConnection
    {
        $connection = UserConnection::findOrFail($connectionId);
        $connection->update([
            'status' => 'declined',
        ]);

        return $connection;
    }

    /**
     * Undo a pending request (unsend)
     */
    public function undoRequest(int $connectionId): void
    {
        UserConnection::findOrFail($connectionId)->delete();
    }

    /**
     * Undo a connection acceptance (within 24h window)
     */
    public function undoConnection(int $connectionId): UserConnection
    {
        $connection = UserConnection::findOrFail($connectionId);
        $connection->update([
            'status' => 'undone',
        ]);

        return $connection;
    }

    /**
     * Get all accepted connections for a user
     */
    public function getConnections(int $userId, ?string $relationshipType = null)
    {
        $query = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            });

        if ($relationshipType) {
            $query->where('relationship_type', $relationshipType);
        }

        return $query->with(['requester', 'recipient'])->get();
    }

    /**
     * Get pending requests received by user
     */
    public function getPendingRequests(int $userId)
    {
        return UserConnection::where('recipient_user_id', $userId)
            ->where('status', 'pending')
            ->with(['requester', 'recipient'])
            ->orderBy('requested_at', 'desc')
            ->get();
    }

    /**
     * Get pending requests sent by user
     */
    public function getSentRequests(int $userId)
    {
        return UserConnection::where('requester_user_id', $userId)
            ->where('status', 'pending')
            ->with(['requester', 'recipient'])
            ->orderBy('requested_at', 'desc')
            ->get();
    }

    /**
     * Check if connection already exists between two users with specific relationship
     */
    public function connectionExists(int $userId1, int $userId2, string $relationshipType): bool
    {
        return UserConnection::where(function ($q) use ($userId1, $userId2) {
            $q->where('requester_user_id', $userId1)
              ->where('recipient_user_id', $userId2)
              ->orWhere(function ($q) use ($userId1, $userId2) {
                  $q->where('requester_user_id', $userId2)
                    ->where('recipient_user_id', $userId1);
              });
        })
        ->where('relationship_type', $relationshipType)
        ->where('status', '!=', 'declined')
        ->where('status', '!=', 'undone')
        ->exists();
    }

    /**
     * Get specific connection between two users
     */
    public function getConnection(int $userId1, int $userId2, string $relationshipType): ?UserConnection
    {
        return UserConnection::where(function ($q) use ($userId1, $userId2) {
            $q->where('requester_user_id', $userId1)
              ->where('recipient_user_id', $userId2)
              ->orWhere(function ($q) use ($userId1, $userId2) {
                  $q->where('requester_user_id', $userId2)
                    ->where('recipient_user_id', $userId1);
              });
        })
        ->where('relationship_type', $relationshipType)
        ->where('status', '!=', 'declined')
        ->where('status', '!=', 'undone')
        ->first();
    }

    /**
     * Get all connections with specific relationship type for a user
     */
    public function getConnectionsByType(int $userId, string $relationshipType)
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->where('relationship_type', $relationshipType)
            ->with(['requester', 'recipient'])
            ->get();
    }

    /**
     * Count user's accepted connections
     */
    public function getConnectionCount(int $userId): int
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId) {
                $q->where('requester_user_id', $userId)
                  ->orWhere('recipient_user_id', $userId);
            })
            ->count();
    }

    /**
     * Get pending requests count for user
     */
    public function getPendingRequestCount(int $userId): int
    {
        return UserConnection::where('recipient_user_id', $userId)
            ->where('status', 'pending')
            ->count();
    }

    /**
     * Get mutual connections between two users
     */
    public function getMutualConnections(int $userId1, int $userId2)
    {
        // Get all connections of user 1
        $user1Connections = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId1) {
                $q->where('requester_user_id', $userId1)
                  ->orWhere('recipient_user_id', $userId1);
            })
            ->get()
            ->map(function ($connection) use ($userId1) {
                return $connection->requester_user_id === $userId1
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;
            });

        // Get all connections of user 2
        $user2Connections = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId2) {
                $q->where('requester_user_id', $userId2)
                  ->orWhere('recipient_user_id', $userId2);
            })
            ->get()
            ->map(function ($connection) use ($userId2) {
                return $connection->requester_user_id === $userId2
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;
            });

        // Find intersection
        $mutualIds = $user1Connections->intersect($user2Connections);

        // Get the actual user records
        return User::whereIn('id', $mutualIds)->get();
    }

    /**
     * Get relationship type(s) between two users
     *
     * @param int $userId1
     * @param int $userId2
     * @return array|null - Array of relationship types or null if not connected
     */
    public function getConnectionType(int $userId1, int $userId2): ?array
    {
        $connections = UserConnection::where('status', 'accepted')
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
            ->pluck('relationship_type')
            ->toArray();

        return count($connections) > 0 ? $connections : null;
    }

    /**
     * Get pending request between two users (if any)
     *
     * @param int $userId1
     * @param int $userId2
     * @return UserConnection|null
     */
    public function getPendingRequestBetween(int $userId1, int $userId2): ?UserConnection
    {
        return UserConnection::where('status', 'pending')
            ->where('requester_user_id', $userId2)
            ->where('recipient_user_id', $userId1)
            ->first();
    }

    /**
     * Get sent request between two users (if any)
     *
     * @param int $userId1
     * @param int $userId2
     * @return UserConnection|null
     */
    public function getSentRequestBetween(int $userId1, int $userId2): ?UserConnection
    {
        return UserConnection::where('status', 'pending')
            ->where('requester_user_id', $userId1)
            ->where('recipient_user_id', $userId2)
            ->first();
    }
}
