<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\UserConnection;
use Illuminate\Database\Eloquent\Collection;

class UserConnectionRepository
{
    /**
     * Get all connections for a user (both sent and received)
     */
    public function getUserConnections(int $userId): Collection
    {
        return UserConnection::where(function ($query) use ($userId) {
            $query->where('requester_user_id', $userId)
                ->orWhere('recipient_user_id', $userId);
        })
        ->with(['requester:id,first_name,last_name,username,email,profile_image', 'recipient:id,first_name,last_name,username,email,profile_image'])
        ->orderByDesc('created_at')
        ->get();
    }

    /**
     * Get connections count by status
     */
    public function getConnectionCountByStatus(int $userId, string $status): int
    {
        return UserConnection::where(function ($query) use ($userId) {
            $query->where('requester_user_id', $userId)
                ->orWhere('recipient_user_id', $userId);
        })
        ->where('status', $status)
        ->count();
    }

    /**
     * Get all accepted connections
     */
    public function getAcceptedConnections(int $userId): Collection
    {
        return UserConnection::where(function ($query) use ($userId) {
            $query->where('requester_user_id', $userId)
                ->orWhere('recipient_user_id', $userId);
        })
        ->where('status', 'accepted')
        ->with(['requester:id,first_name,last_name,username,email,profile_image', 'recipient:id,first_name,last_name,username,email,profile_image'])
        ->orderByDesc('accepted_at')
        ->get();
    }

    /**
     * Get pending connections
     */
    public function getPendingConnections(int $userId): Collection
    {
        return UserConnection::where(function ($query) use ($userId) {
            $query->where('requester_user_id', $userId)
                ->orWhere('recipient_user_id', $userId);
        })
        ->where('status', 'pending')
        ->with(['requester:id,first_name,last_name,username,email,profile_image', 'recipient:id,first_name,last_name,username,email,profile_image'])
        ->orderByDesc('created_at')
        ->get();
    }

    /**
     * Get sent connection requests
     */
    public function getSentConnections(int $userId): Collection
    {
        return UserConnection::where('requester_user_id', $userId)
        ->with(['recipient:id,first_name,last_name,username,email,profile_image'])
        ->orderByDesc('created_at')
        ->get();
    }

    /**
     * Get received connection requests
     */
    public function getReceivedConnections(int $userId): Collection
    {
        return UserConnection::where('recipient_user_id', $userId)
        ->where('status', 'pending')
        ->with(['requester:id,first_name,last_name,username,email,profile_image'])
        ->orderByDesc('created_at')
        ->get();
    }

    /**
     * Find a connection by ID
     */
    public function find(int $connectionId): ?UserConnection
    {
        return UserConnection::with(['requester:id,first_name,last_name,username,email,profile_image', 'recipient:id,first_name,last_name,username,email,profile_image'])->find($connectionId);
    }

    /**
     * Delete a connection
     */
    public function delete(int $connectionId): bool
    {
        return UserConnection::destroy($connectionId) > 0;
    }
}
