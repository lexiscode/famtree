<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\User;
use Carbon\Carbon;

class UserConnectionRepository
{
    /**
     * Send a connection request
     *
     * IMPORTANT: Connection requests are ALWAYS created with 'pending' status.
     * This ensures the recipient must explicitly accept the request.
     * NO automatic acceptance is allowed under any circumstances.
     */
    public function sendRequest(int $requesterId, int $recipientId, string $relationshipType, ?int $otherParentId = null): UserConnection
    {
        return UserConnection::create([
            'requester_user_id' => $requesterId,
            'recipient_user_id' => $recipientId,
            'relationship_type' => $relationshipType,
            'other_parent_id' => $otherParentId,
            'status' => 'pending',  // Always pending - recipient must accept
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
            'expires_at' => null, // No expiry - users can undo at any time
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
     * Mark a spousal connection as divorced
     */
    public function divorceConnection(int $connectionId): UserConnection
    {
        $connection = UserConnection::findOrFail($connectionId);
        $connection->update([
            'divorced_at' => now(),
        ]);

        return $connection;
    }

    /**
     * Undo a connection acceptance at any time
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
     * Get connection between two users (regardless of direction)
     */
    public function getConnectionBetween(int $userId1, int $userId2): ?UserConnection
    {
        return UserConnection::where('status', 'accepted')
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
     * This method handles bidirectional relationships by also searching for inverse relationships
     */
    public function getConnectionsByType(int $userId, string $relationshipType)
    {
        // Get possible inverse relationship types
        $inverseTypes = $this->getPossibleInverseTypes($relationshipType);

        return UserConnection::where('status', 'accepted')
            ->where(function ($q) use ($userId, $relationshipType, $inverseTypes) {
                // User is requester with the exact relationship type
                $q->where(function ($q) use ($userId, $relationshipType) {
                    $q->where('requester_user_id', $userId)
                      ->where('relationship_type', $relationshipType);
                });

                // OR user is recipient with inverse relationship type
                if (!empty($inverseTypes)) {
                    $q->orWhere(function ($q) use ($userId, $inverseTypes) {
                        $q->where('recipient_user_id', $userId)
                          ->whereIn('relationship_type', $inverseTypes);
                    });
                }
            })
            ->with(['requester', 'recipient'])
            ->get();
    }

    /**
     * Get possible inverse relationship types for nuclear family relationships
     *
     * @param string $relationshipType
     * @return array
     */
    private function getPossibleInverseTypes(string $relationshipType): array
    {
        $inverseMap = [
            // When looking for 'son', also find connections where user is recipient of 'father'
            'son' => ['father'],
            'daughter' => ['mother', 'father'],

            // When looking for 'father', also find connections where user is recipient of 'son' or 'daughter'
            'father' => ['son', 'daughter'],
            'mother' => ['son', 'daughter'],

            // When looking for 'wife', also find connections where user is recipient of 'husband'
            'wife' => ['husband'],
            'husband' => ['wife'],

            // Other relationships
            'brother' => ['brother', 'sister'],
            'sister' => ['brother', 'sister'],
            'cousin' => ['cousin'],
            'first_cousin' => ['first_cousin'],
            'second_cousin' => ['second_cousin'],
            'third_cousin' => ['third_cousin'],
            'aunt' => ['nephew', 'niece'],
            'uncle' => ['nephew', 'niece'],
            'uncle_by_marriage' => ['nephew_by_marriage', 'niece_by_marriage'],
            'aunt_by_marriage' => ['nephew_by_marriage', 'niece_by_marriage'],
            'nephew' => ['aunt', 'uncle'],
            'niece' => ['aunt', 'uncle'],
            'nephew_by_marriage' => ['uncle_by_marriage', 'aunt_by_marriage'],
            'niece_by_marriage' => ['uncle_by_marriage', 'aunt_by_marriage'],
            'great_grandmother' => ['great_grandson', 'great_granddaughter', 'great_grandchild'],
            'great_grandfather' => ['great_grandson', 'great_granddaughter', 'great_grandchild'],
            'great_grandson' => ['great_grandmother', 'great_grandfather'],
            'great_granddaughter' => ['great_grandmother', 'great_grandfather'],
            'great_grandchild' => ['great_grandmother', 'great_grandfather'],
            'great_great_grandmother' => ['great_great_grandson', 'great_great_granddaughter', 'great_great_grandchild'],
            'great_great_grandfather' => ['great_great_grandson', 'great_great_granddaughter', 'great_great_grandchild'],
            'great_great_grandson' => ['great_great_grandmother', 'great_great_grandfather'],
            'great_great_granddaughter' => ['great_great_grandmother', 'great_great_grandfather'],
            'great_great_grandchild' => ['great_great_grandmother', 'great_great_grandfather'],
        ];

        return $inverseMap[$relationshipType] ?? [];
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
            })
            ->values(); // Reset keys to sequential integers

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
            })
            ->values(); // Reset keys to sequential integers

        // Find intersection using native PHP function to avoid collection issues
        $mutualIds = array_intersect(
            $user1Connections->toArray(),
            $user2Connections->toArray()
        );

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
        // Gender-aware inverse: parent-child
        if (in_array($relationshipType, ['son', 'daughter', 'child'])) {
            if ($requesterGender === 'male') return 'father';
            if ($requesterGender === 'female') return 'mother';
            return 'parent';
        }
        if (in_array($relationshipType, ['mother', 'father', 'parent'])) {
            if ($requesterGender === 'male') return 'son';
            if ($requesterGender === 'female') return 'daughter';
            return 'child';
        }

        // Gender-aware inverse: siblings
        if (in_array($relationshipType, ['brother', 'sister', 'sibling'])) {
            if ($requesterGender === 'male') return 'brother';
            if ($requesterGender === 'female') return 'sister';
            return 'sibling';
        }

        // Gender-aware inverse: grandparent-grandchild
        if (in_array($relationshipType, ['grandson', 'granddaughter', 'grandchild'])) {
            if ($requesterGender === 'male') return 'grandfather';
            if ($requesterGender === 'female') return 'grandmother';
            return 'grandparent';
        }
        if (in_array($relationshipType, ['grandmother', 'grandfather', 'grandparent'])) {
            if ($requesterGender === 'male') return 'grandson';
            if ($requesterGender === 'female') return 'granddaughter';
            return 'grandchild';
        }

        // Gender-aware inverse: great-grandparent-great-grandchild
        if (in_array($relationshipType, ['great_grandson', 'great_granddaughter', 'great_grandchild'])) {
            if ($requesterGender === 'male') return 'great_grandfather';
            if ($requesterGender === 'female') return 'great_grandmother';
            return 'great_grandparent';
        }
        if (in_array($relationshipType, ['great_grandmother', 'great_grandfather'])) {
            if ($requesterGender === 'male') return 'great_grandson';
            if ($requesterGender === 'female') return 'great_granddaughter';
            return 'great_grandchild';
        }

        // Gender-aware inverse: great-great-grandparent-great-great-grandchild
        if (in_array($relationshipType, ['great_great_grandson', 'great_great_granddaughter', 'great_great_grandchild'])) {
            if ($requesterGender === 'male') return 'great_great_grandfather';
            if ($requesterGender === 'female') return 'great_great_grandmother';
            return 'great_great_grandparent';
        }
        if (in_array($relationshipType, ['great_great_grandmother', 'great_great_grandfather'])) {
            if ($requesterGender === 'male') return 'great_great_grandson';
            if ($requesterGender === 'female') return 'great_great_granddaughter';
            return 'great_great_grandchild';
        }

        // Gender-aware inverse: aunt/uncle ↔ niece/nephew
        if (in_array($relationshipType, ['niece', 'nephew'])) {
            if ($requesterGender === 'male') return 'uncle';
            if ($requesterGender === 'female') return 'aunt';
            return 'uncle';
        }
        if (in_array($relationshipType, ['aunt', 'uncle'])) {
            if ($requesterGender === 'male') return 'nephew';
            if ($requesterGender === 'female') return 'niece';
            return 'nephew';
        }

        // Gender-aware inverse: uncle/aunt by marriage ↔ nephew/niece by marriage
        if (in_array($relationshipType, ['uncle_by_marriage', 'aunt_by_marriage'])) {
            if ($requesterGender === 'male') return 'nephew_by_marriage';
            if ($requesterGender === 'female') return 'niece_by_marriage';
            return 'nephew_by_marriage';
        }
        if (in_array($relationshipType, ['nephew_by_marriage', 'niece_by_marriage'])) {
            if ($requesterGender === 'male') return 'uncle_by_marriage';
            if ($requesterGender === 'female') return 'aunt_by_marriage';
            return 'uncle_by_marriage';
        }

        // Gender-aware inverse: step-parent ↔ step-child
        if (in_array($relationshipType, ['step_son', 'step_daughter', 'step_child'])) {
            if ($requesterGender === 'male') return 'step_father';
            if ($requesterGender === 'female') return 'step_mother';
            return 'step_father';
        }
        if (in_array($relationshipType, ['step_mother', 'step_father'])) {
            if ($requesterGender === 'male') return 'step_son';
            if ($requesterGender === 'female') return 'step_daughter';
            return 'step_child';
        }

        // Gender-aware inverse: step-siblings
        if (in_array($relationshipType, ['step_brother', 'step_sister', 'step_sibling'])) {
            if ($requesterGender === 'male') return 'step_brother';
            if ($requesterGender === 'female') return 'step_sister';
            return 'step_sibling';
        }

        // Gender-aware inverse: in-law parent ↔ in-law child
        if (in_array($relationshipType, ['mother_in_law', 'father_in_law'])) {
            if ($requesterGender === 'male') return 'son_in_law';
            if ($requesterGender === 'female') return 'daughter_in_law';
            return 'son_in_law';
        }
        if (in_array($relationshipType, ['son_in_law', 'daughter_in_law'])) {
            if ($requesterGender === 'male') return 'father_in_law';
            if ($requesterGender === 'female') return 'mother_in_law';
            return 'father_in_law';
        }

        // Gender-aware inverse: in-law siblings
        if (in_array($relationshipType, ['sister_in_law', 'brother_in_law'])) {
            if ($requesterGender === 'male') return 'brother_in_law';
            if ($requesterGender === 'female') return 'sister_in_law';
            return 'brother_in_law';
        }

        // Gender-aware inverse: ex-in-law parent ↔ ex-in-law child
        if (in_array($relationshipType, ['ex_mother_in_law', 'ex_father_in_law'])) {
            if ($requesterGender === 'male') return 'ex_son_in_law';
            if ($requesterGender === 'female') return 'ex_daughter_in_law';
            return 'ex_son_in_law';
        }
        if (in_array($relationshipType, ['ex_son_in_law', 'ex_daughter_in_law'])) {
            if ($requesterGender === 'male') return 'ex_father_in_law';
            if ($requesterGender === 'female') return 'ex_mother_in_law';
            return 'ex_father_in_law';
        }

        // Gender-aware inverse: ex-in-law siblings
        if (in_array($relationshipType, ['ex_sister_in_law', 'ex_brother_in_law'])) {
            if ($requesterGender === 'male') return 'ex_brother_in_law';
            if ($requesterGender === 'female') return 'ex_sister_in_law';
            return 'ex_brother_in_law';
        }

        // Simple bidirectional/symmetric types
        $inverseMap = [
            'wife' => 'husband',
            'husband' => 'wife',
            'partner' => 'partner',
            'cousin' => 'cousin',
            'first_cousin' => 'first_cousin',
            'second_cousin' => 'second_cousin',
            'third_cousin' => 'third_cousin',
            'godparent' => 'godchild',
            'godchild' => 'godparent',
        ];

        return $inverseMap[$relationshipType] ?? $relationshipType;
    }
}
