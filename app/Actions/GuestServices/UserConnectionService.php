<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\UserProfileRepository;
use App\Models\GuestModels\RelationshipType;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class UserConnectionService
{
    public function __construct(
        private UserConnectionRepository $connectionRepository,
        private UserProfileRepository $profileRepository
    ) {
    }

    /**
     * Send a connection request with full validation
     */
    public function sendConnectionRequest(int $requesterId, int $recipientId, string $relationshipType): array
    {
        // Validate users exist
        $requester = $this->profileRepository->getProfile($requesterId);
        $recipient = $this->profileRepository->getProfile($recipientId);

        if (!$requester || !$recipient) {
            throw ValidationException::withMessages([
                'user' => ['One or both users not found'],
            ]);
        }

        // Prevent self-connections
        if ($requesterId === $recipientId) {
            throw ValidationException::withMessages([
                'recipient' => ['You cannot connect with yourself'],
            ]);
        }

        // Validate relationship type exists
        $relationType = RelationshipType::where('type_key', $relationshipType)->first();
        if (!$relationType) {
            throw ValidationException::withMessages([
                'relationship_type' => ['Invalid relationship type'],
            ]);
        }

        // Check for duplicate connections
        if ($this->connectionRepository->connectionExists($requesterId, $recipientId, $relationshipType)) {
            throw ValidationException::withMessages([
                'connection' => ['A connection of this type already exists between you and this user'],
            ]);
        }

        // Check for duplicate parent connections (user can only have one mother and one father)
        if (in_array($relationshipType, ['mother', 'father'])) {
            $existingParent = $this->connectionRepository->getConnectionsByType($recipientId, $relationshipType);
            if ($existingParent->isNotEmpty()) {
                $parentType = $relationshipType === 'mother' ? 'mother' : 'father';
                throw ValidationException::withMessages([
                    'parent' => ["This user already has a $parentType"],
                ]);
            }
        }

        // Create the connection request
        $connection = $this->connectionRepository->sendRequest($requesterId, $recipientId, $relationshipType);

        return [
            'success' => true,
            'message' => 'Connection request sent successfully',
            'connection' => $connection,
        ];
    }

    /**
     * Accept a connection request
     */
    public function acceptConnection(int $connectionId, int $userId): array
    {
        $connection = \App\Models\GuestModels\UserConnection::findOrFail($connectionId);

        // Verify user is the recipient
        if ($connection->recipient_user_id !== $userId) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to accept this request'],
            ]);
        }

        // Verify request is pending
        if (!$connection->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['This request is no longer pending'],
            ]);
        }

        $this->connectionRepository->acceptRequest($connectionId);

        return [
            'success' => true,
            'message' => 'Connection request accepted',
            'connection' => $connection->fresh(['requester', 'recipient']),
        ];
    }

    /**
     * Decline a connection request
     */
    public function declineConnection(int $connectionId, int $userId): array
    {
        $connection = \App\Models\GuestModels\UserConnection::findOrFail($connectionId);

        // Verify user is the recipient
        if ($connection->recipient_user_id !== $userId) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to decline this request'],
            ]);
        }

        // Verify request is pending
        if (!$connection->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['This request is no longer pending'],
            ]);
        }

        $this->connectionRepository->declineRequest($connectionId);

        return [
            'success' => true,
            'message' => 'Connection request declined',
        ];
    }

    /**
     * Unsend a pending request
     */
    public function undoRequest(int $connectionId, int $userId): array
    {
        $connection = \App\Models\GuestModels\UserConnection::findOrFail($connectionId);

        // Verify user is the requester
        if ($connection->requester_user_id !== $userId) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to undo this request'],
            ]);
        }

        // Verify request is pending
        if (!$connection->isPending()) {
            throw ValidationException::withMessages([
                'request' => ['You can only undo pending requests'],
            ]);
        }

        $this->connectionRepository->undoRequest($connectionId);

        return [
            'success' => true,
            'message' => 'Connection request unsent',
        ];
    }

    /**
     * Undo connection acceptance within 24h window
     */
    public function undoConnection(int $connectionId, int $userId): array
    {
        $connection = \App\Models\GuestModels\UserConnection::findOrFail($connectionId);

        // Verify user is one of the parties
        if ($connection->requester_user_id !== $userId && $connection->recipient_user_id !== $userId) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to undo this connection'],
            ]);
        }

        // Verify connection is active
        if (!$connection->isActive()) {
            throw ValidationException::withMessages([
                'connection' => ['This connection is not active'],
            ]);
        }

        // Check if within 24h window
        if (!$connection->canUndo()) {
            throw ValidationException::withMessages([
                'undo_window' => ['The 24-hour undo window for this connection has expired'],
            ]);
        }

        $this->connectionRepository->undoConnection($connectionId);

        return [
            'success' => true,
            'message' => 'Connection undone successfully',
        ];
    }

    /**
     * Get all connections for a user
     */
    public function getConnections(int $userId, ?string $relationshipType = null): array
    {
        $connections = $this->connectionRepository->getConnections($userId, $relationshipType);

        return [
            'connections' => $connections->map(fn($conn) => $this->formatConnection($conn, $userId)),
            'count' => $connections->count(),
        ];
    }

    /**
     * Get pending requests received by user
     */
    public function getPendingRequests(int $userId): array
    {
        $requests = $this->connectionRepository->getPendingRequests($userId);

        return [
            'requests' => $requests->map(fn($req) => $this->formatConnectionRequest($req, $userId)),
            'count' => $requests->count(),
        ];
    }

    /**
     * Get pending requests sent by user
     */
    public function getSentRequests(int $userId): array
    {
        $requests = $this->connectionRepository->getSentRequests($userId);

        return [
            'requests' => $requests->map(fn($req) => $this->formatSentRequest($req)),
            'count' => $requests->count(),
        ];
    }

    /**
     * Get mutual connections between two users
     */
    public function getMutualConnections(int $userId1, int $userId2): array
    {
        $mutuals = $this->connectionRepository->getMutualConnections($userId1, $userId2);

        return [
            'mutual_connections' => $mutuals,
            'count' => $mutuals->count(),
        ];
    }

    /**
     * Get relationship label between two users
     */
    public function getRelationshipLabel(int $fromUserId, int $toUserId): ?string
    {
        // Find all connections from user 1 to user 2
        $connection = \App\Models\GuestModels\UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($fromUserId, $toUserId) {
                $q->where('requester_user_id', $fromUserId)
                  ->where('recipient_user_id', $toUserId)
                  ->orWhere(function ($q) use ($fromUserId, $toUserId) {
                      $q->where('requester_user_id', $toUserId)
                        ->where('recipient_user_id', $fromUserId);
                  });
            })
            ->with('relationshipType')
            ->first();

        if (!$connection) {
            return null;
        }

        // Determine the label based on direction
        if ($connection->requester_user_id === $fromUserId) {
            return $connection->relationshipType->label ?? $connection->relationship_type;
        } else {
            // Reverse relationship
            $reverseType = RelationshipType::where('type_key', $connection->relationshipType->reverse_type_key)->first();
            return $reverseType ? $reverseType->label : $connection->relationshipType->label;
        }
    }

    /**
     * Format connection for API response
     */
    private function formatConnection($connection, int $userId): array
    {
        $otherUser = $connection->requester_user_id === $userId ? $connection->recipient : $connection->requester;
        $isRequester = $connection->requester_user_id === $userId;

        return [
            'id' => $connection->id,
            'user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->first_name . ' ' . $otherUser->last_name,
                'username' => $otherUser->username,
                'profile_image_url' => $otherUser->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'relationship_label' => $connection->relationshipType?->label,
            'status' => $connection->status,
            'accepted_at' => $connection->accepted_at,
            'can_undo' => $connection->canUndo(),
            'undo_expires_at' => $connection->expires_at,
        ];
    }

    /**
     * Format connection request for API response
     */
    private function formatConnectionRequest($connection, int $userId): array
    {
        return [
            'id' => $connection->id,
            'requester' => [
                'id' => $connection->requester->id,
                'name' => $connection->requester->first_name . ' ' . $connection->requester->last_name,
                'username' => $connection->requester->username,
                'profile_image_url' => $connection->requester->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'relationship_label' => $connection->relationshipType?->label,
            'requested_at' => $connection->requested_at,
        ];
    }

    /**
     * Format sent request for API response
     */
    private function formatSentRequest($connection): array
    {
        return [
            'id' => $connection->id,
            'recipient' => [
                'id' => $connection->recipient->id,
                'name' => $connection->recipient->first_name . ' ' . $connection->recipient->last_name,
                'username' => $connection->recipient->username,
                'profile_image_url' => $connection->recipient->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'relationship_label' => $connection->relationshipType?->label,
            'requested_at' => $connection->requested_at,
        ];
    }
}
