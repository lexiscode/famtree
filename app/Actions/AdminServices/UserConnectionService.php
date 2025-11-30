<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\UserConnectionRepository;
use App\Repositories\AdminRepositories\UserRepository;

class UserConnectionService
{
    /**
     * Create service with injected repositories
     */
    public function __construct(
        private UserConnectionRepository $connectionRepository,
        private UserRepository $userRepository
    ) {
    }

    /**
     * Get all connections for a user with formatted data
     */
    public function getUserConnections(int $userId): array
    {
        $user = $this->userRepository->find($userId);
        if (!$user) {
            return ['connections' => [], 'stats' => []];
        }

        $connections = $this->connectionRepository->getUserConnections($userId);

        return [
            'connections' => $connections->map(function ($connection) use ($userId) {
                return $this->formatConnection($connection, $userId);
            })->toArray(),
            'stats' => $this->getConnectionStats($userId),
        ];
    }

    /**
     * Format a connection record
     */
    private function formatConnection($connection, int $userId): array
    {
        $isRequester = $connection->requester_user_id === $userId;
        $otherUser = $isRequester ? $connection->recipient : $connection->requester;

        return [
            'id' => $connection->id,
            'connection_type' => $isRequester ? 'sent' : 'received',
            'other_user' => [
                'id' => $otherUser->id,
                'first_name' => $otherUser->first_name,
                'last_name' => $otherUser->last_name,
                'full_name' => "{$otherUser->first_name} {$otherUser->last_name}",
                'username' => $otherUser->username,
                'email' => $otherUser->email,
                'profile_image_url' => $otherUser->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'status' => $connection->status,
            'requested_at' => $connection->requested_at?->format('Y-m-d H:i:s'),
            'requested_at_formatted' => $connection->requested_at?->diffForHumans() ?? 'N/A',
            'accepted_at' => $connection->accepted_at?->format('Y-m-d H:i:s'),
            'accepted_at_formatted' => $connection->accepted_at?->diffForHumans() ?? 'N/A',
            'created_at' => $connection->created_at->format('Y-m-d'),
            'created_at_formatted' => $connection->created_at->diffForHumans(),
        ];
    }

    /**
     * Get connection statistics
     */
    private function getConnectionStats(int $userId): array
    {
        return [
            'total' => $this->connectionRepository->getUserConnections($userId)->count(),
            'accepted' => $this->connectionRepository->getConnectionCountByStatus($userId, 'accepted'),
            'pending' => $this->connectionRepository->getConnectionCountByStatus($userId, 'pending'),
            'sent' => $this->connectionRepository->getSentConnections($userId)->count(),
            'received' => $this->connectionRepository->getReceivedConnections($userId)->count(),
        ];
    }

    /**
     * Remove/delete a connection
     */
    public function removeConnection(int $connectionId): bool
    {
        return $this->connectionRepository->delete($connectionId);
    }
}
