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
     * Create a direct connection (used for child accounts)
     */
    public function createConnection(array $data): UserConnection
    {
        return UserConnection::create($data);
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
        $connection = UserConnection::findOrFail($connectionId);
        $connection->update([
            'status' => 'undone',
        ]);
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
     * Delete a connection between two users (regardless of direction)
     */
    public function deleteConnectionBetween(int $userId1, int $userId2): bool
    {
        $deleted = UserConnection::where(function ($q) use ($userId1, $userId2) {
            $q->where(function ($q) use ($userId1, $userId2) {
                $q->where('requester_user_id', $userId1)
                  ->where('recipient_user_id', $userId2);
            })
            ->orWhere(function ($q) use ($userId1, $userId2) {
                $q->where('requester_user_id', $userId2)
                  ->where('recipient_user_id', $userId1);
            });
        })->update(['status' => 'undone']);

        return $deleted > 0;
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
     * Get pending requests count for user (received)
     */
    public function getPendingRequestCount(int $userId): int
    {
        return UserConnection::where('recipient_user_id', $userId)
            ->where('status', 'pending')
            ->count();
    }

    /**
     * Get sent requests count for user
     */
    public function getSentRequestCount(int $userId): int
    {
        return UserConnection::where('requester_user_id', $userId)
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

    /**
     * Get the relationship type from the viewer's perspective
     * Handles inverse relationships (e.g., if requester is "brother", recipient sees "sister")
     *
     * @param int $viewerId The person viewing the profile
     * @param int $ownerId The person whose profile is being viewed
     * @return string|null The relationship label from viewer's perspective
     */
    public function getRelationshipFromViewerPerspective(int $viewerId, int $ownerId): ?string
    {
        $connection = UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($viewerId, $ownerId) {
                $q->where(function ($q) use ($viewerId, $ownerId) {
                    $q->where('requester_user_id', $viewerId)
                      ->where('recipient_user_id', $ownerId);
                })
                ->orWhere(function ($q) use ($viewerId, $ownerId) {
                    $q->where('requester_user_id', $ownerId)
                      ->where('recipient_user_id', $viewerId);
                });
            })
            ->first();

        if (!$connection) {
            return null;
        }

        // If the viewer is the requester, return the relationship type as-is
        if ($connection->requester_user_id === $viewerId) {
            return $connection->relationship_type;
        }

        // If the viewer is the recipient, return the inverse relationship
        // Pass both users' genders for context-aware inverse mapping
        $requester = User::find($connection->requester_user_id);
        $recipient = User::find($connection->recipient_user_id);
        return $this->getInverseRelationship($connection->relationship_type, $requester?->gender, $recipient?->gender);
    }

    /**
     * Get the inverse relationship type
     * Maps relationships to their inverses, considering gender context
     *
     * @param string $relationshipType
     * @param string|null $requesterGender The gender of the person who initiated the relationship
     * @param string|null $recipientGender The gender of the recipient
     * @return string The inverse relationship
     */
    private function getInverseRelationship(string $relationshipType, ?string $requesterGender = null, ?string $recipientGender = null): string
    {
        // For son/daughter relationships, determine parent gender
        if (($relationshipType === 'son' || $relationshipType === 'daughter') && $requesterGender) {
            return $requesterGender === 'male' ? 'father' : 'mother';
        }

        // Handle gender-specific sibling relationships
        if ($relationshipType === 'brother' && $recipientGender === 'male') {
            return 'brother'; // Same gender -> same relationship
        }
        if ($relationshipType === 'sister' && $recipientGender === 'female') {
            return 'sister'; // Same gender -> same relationship
        }

        $inverseMap = [
            // Spousal relationships (bidirectional)
            'wife' => 'husband',
            'husband' => 'wife',
            'partner' => 'partner',

            // Parent-child (non-bidirectional)
            'mother' => 'child',
            'father' => 'child',
            'child' => 'mother', // Default to mother if not specified
            'son' => 'father', // Default to father if gender not available
            'daughter' => 'mother', // Default to mother if gender not available

            // Sibling (bidirectional)
            'sibling' => 'sibling',
            'brother' => 'sister',
            'sister' => 'brother',

            // Grandparent-grandchild (non-bidirectional)
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandchild' => 'grandmother', // or grandfather
            'grandson' => 'grandmother', // or grandfather
            'granddaughter' => 'grandmother', // or grandfather

            // Extended family (non-bidirectional)
            'aunt' => 'niece', // or nephew
            'uncle' => 'niece', // or nephew
            'niece' => 'aunt',
            'nephew' => 'uncle',
            'cousin' => 'cousin',

            // Step relationships (non-bidirectional)
            'step_mother' => 'step_child',
            'step_father' => 'step_child',
            'step_sibling' => 'step_sibling',
            'step_child' => 'step_mother', // or step_father

            // In-law relationships (non-bidirectional)
            'mother_in_law' => 'child', // This would need more context
            'father_in_law' => 'child', // This would need more context
            'sister_in_law' => 'sister_in_law',
            'brother_in_law' => 'brother_in_law',

            // Other relationships (non-bidirectional)
            'godparent' => 'godchild',
            'godchild' => 'godparent',
        ];

        return $inverseMap[$relationshipType] ?? $relationshipType;
    }
}
