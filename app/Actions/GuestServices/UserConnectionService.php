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

        // Determine the correct relationship label based on who is viewing
        // If the current user is the requester, use the stored relationship type as-is
        // If the current user is the recipient, use the inverse relationship
        if ($isRequester) {
            // User is the requester: use stored relationship type
            $relationshipLabel = $connection->relationshipType?->label ?? $connection->relationship_type;
        } else {
            // User is the recipient: use inverse relationship
            $relationshipLabel = $this->connectionRepository->getRelationshipFromViewerPerspective($userId, $otherUser->id);
        }

        return [
            'id' => $connection->id,
            'user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->first_name . ' ' . $otherUser->last_name,
                'username' => $otherUser->username,
                'profile_image_url' => $otherUser->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'relationship_label' => $relationshipLabel,
            'status' => $connection->status,
            'accepted_at' => $connection->accepted_at,
            'can_undo' => $connection->canUndo(),
            'undo_expires_at' => $connection->expires_at,
        ];
    }

    /**
     * Format connection request for API response
     * Shows the relationship from the perspective of the recipient (current user viewing the pending request)
     */
    private function formatConnectionRequest($connection, int $userId): array
    {
        // The recipient is viewing this request, so we need to show the reverse relationship
        // Example: If requester (female) sent "brother", recipient should see "sister"
        $relationshipLabel = $this->getRelationshipLabelFromRecipientPerspective(
            $connection,
            $connection->requester->gender,
            $connection->recipient->gender
        );

        return [
            'id' => $connection->id,
            'requester' => [
                'id' => $connection->requester->id,
                'name' => $connection->requester->first_name . ' ' . $connection->requester->last_name,
                'username' => $connection->requester->username,
                'email' => $connection->requester->email,
                'phone' => $connection->requester->phone,
                'gender' => $connection->requester->gender,
                'date_of_birth' => $connection->requester->date_of_birth?->format('Y-m-d'),
                'bio' => $connection->requester->bio,
                'address' => $connection->requester->address,
                'status' => $connection->requester->status,
                'profile_image_url' => $connection->requester->profile_image_url,
            ],
            'relationship_type' => $connection->relationship_type,
            'relationship_label' => $relationshipLabel,
            'requested_at' => $connection->requested_at,
        ];
    }

    /**
     * Get the relationship label from the recipient's perspective
     * Considers gender of both users to determine the correct relationship type
     */
    private function getRelationshipLabelFromRecipientPerspective($connection, ?string $requesterGender, ?string $recipientGender): string
    {
        $relationshipType = $connection->relationship_type;

        // Get the inverse relationship based on the logic in UserConnectionRepository
        $inverseMap = $this->getInverseRelationshipMap();
        $inverseType = $inverseMap[$relationshipType] ?? $relationshipType;

        // Special handling for gender-specific relationships
        // If both genders are the same and the relationship is gender-specific, don't reverse
        if ($requesterGender && $recipientGender && $requesterGender === $recipientGender) {
            // Both are the same gender - apply same-gender logic
            return $this->getGenderAwareRelationshipLabel($relationshipType, $requesterGender, $recipientGender);
        }

        // For different genders, we need to apply gender-specific inversions
        if ($requesterGender && $recipientGender && $requesterGender !== $recipientGender) {
            return $this->getGenderDifferentRelationshipLabel($relationshipType, $requesterGender, $recipientGender);
        }

        // For bidirectional relationships without gender distinctions, return as-is
        if ($this->isBidirectionalNonGenderSpecific($relationshipType)) {
            return $connection->relationshipType?->label ?? $relationshipType;
        }

        // Otherwise, use the inverse relationship
        $inverseRelationshipType = RelationshipType::where('type_key', $inverseType)->first();
        return $inverseRelationshipType?->label ?? $connection->relationshipType?->label ?? $relationshipType;
    }

    /**
     * Get the relationship label when both users have the same gender
     */
    private function getGenderDifferentRelationshipLabel(string $relationshipType, string $requesterGender, string $recipientGender): string
    {
        // Map the inverse based on genders
        $genderSpecificInverseMap = [
            // Siblings (opposite genders)
            'brother' => 'sister',
            'sister' => 'brother',

            // Parent-child (different genders)
            'mother' => 'child', // Can be son or daughter
            'father' => 'child', // Can be son or daughter
            'son' => ($requesterGender === 'male' && $recipientGender === 'female') ? 'mother' : 'father',
            'daughter' => ($requesterGender === 'female' && $recipientGender === 'male') ? 'father' : 'mother',
            'child' => ($recipientGender === 'male') ? 'father' : 'mother',

            // Grandparents-grandchild
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandson' => ($recipientGender === 'female') ? 'grandmother' : 'grandfather',
            'granddaughter' => ($recipientGender === 'female') ? 'grandmother' : 'grandfather',
            'grandchild' => ($requesterGender === 'male') ? 'grandfather' : 'grandmother',

            // Aunt/Uncle - Niece/Nephew
            'aunt' => 'niece', // from female aunt
            'uncle' => 'nephew', // from male uncle - but this depends on recipient gender
            'niece' => ($requesterGender === 'female') ? 'aunt' : 'uncle',
            'nephew' => ($requesterGender === 'male') ? 'uncle' : 'aunt',

            // Step relationships (different genders)
            'step_mother' => 'step_child',
            'step_father' => 'step_child',
            'step_sibling' => 'step_sibling',
            'step_child' => ($recipientGender === 'male') ? 'step_father' : 'step_mother',

            // In-law relationships
            'mother_in_law' => 'child',
            'father_in_law' => 'child',
            'sister_in_law' => ($requesterGender === 'female') ? 'sister_in_law' : 'brother_in_law',
            'brother_in_law' => ($requesterGender === 'male') ? 'brother_in_law' : 'sister_in_law',

            // Godparent - Godchild
            'godparent' => 'godchild',
            'godchild' => 'godparent',
        ];

        $inverseType = $genderSpecificInverseMap[$relationshipType] ?? $relationshipType;

        $inverseRelationshipType = RelationshipType::where('type_key', $inverseType)->first();
        return $inverseRelationshipType?->label ?? RelationshipType::where('type_key', $relationshipType)->first()?->label ?? $relationshipType;
    }

    /**
     * Get the inverse relationship mapping
     */
    private function getInverseRelationshipMap(): array
    {
        return [
            // Spousal relationships (bidirectional)
            'wife' => 'husband',
            'husband' => 'wife',
            'partner' => 'partner',

            // Parent-child (non-bidirectional)
            'mother' => 'child',
            'father' => 'child',
            'child' => 'mother',
            'son' => 'father',
            'daughter' => 'mother',

            // Sibling (bidirectional but gender-specific)
            'sibling' => 'sibling',
            'brother' => 'sister',
            'sister' => 'brother',

            // Grandparent-grandchild (non-bidirectional)
            'grandmother' => 'grandchild',
            'grandfather' => 'grandchild',
            'grandchild' => 'grandmother',
            'grandson' => 'grandfather',
            'granddaughter' => 'grandmother',

            // Extended family (non-bidirectional)
            'aunt' => 'niece',
            'uncle' => 'nephew',
            'niece' => 'aunt',
            'nephew' => 'uncle',
            'cousin' => 'cousin',

            // Step relationships (non-bidirectional)
            'step_mother' => 'step_child',
            'step_father' => 'step_child',
            'step_sibling' => 'step_sibling',
            'step_child' => 'step_mother',

            // In-law relationships (non-bidirectional)
            'mother_in_law' => 'child',
            'father_in_law' => 'child',
            'sister_in_law' => 'sister_in_law',
            'brother_in_law' => 'brother_in_law',

            // Other relationships (non-bidirectional)
            'godparent' => 'godchild',
            'godchild' => 'godparent',
        ];
    }

    /**
     * Check if relationship is bidirectional and doesn't have gender distinctions
     */
    private function isBidirectionalNonGenderSpecific(string $relationshipType): bool
    {
        return in_array($relationshipType, [
            'partner',
            'cousin',
            'sister_in_law',
            'brother_in_law',
            'step_sibling',
        ]);
    }

    /**
     * Get relationship label when both users have the same gender
     * For same-gender relationships, we need to ensure the appropriate gender-specific label
     */
    private function getGenderAwareRelationshipLabel(string $relationshipType, string $requesterGender, string $recipientGender): string
    {
        // Same gender mappings - no reversal needed, just ensure correct gender form
        $sameGenderMap = [
            // Siblings - stay as same gender
            'brother' => ['male' => 'brother', 'female' => 'sister'],
            'sister' => ['male' => 'brother', 'female' => 'sister'],
            'sibling' => ['male' => 'sibling', 'female' => 'sibling'],

            // Parents - both same gender means both same parent type
            'mother' => ['female' => 'mother', 'male' => 'mother'],
            'father' => ['male' => 'father', 'female' => 'father'],

            // Children - both same gender means both same child type
            'son' => ['male' => 'son', 'female' => 'daughter'],
            'daughter' => ['male' => 'son', 'female' => 'daughter'],
            'child' => ['male' => 'son', 'female' => 'daughter'],

            // Grandparents
            'grandmother' => ['female' => 'grandmother', 'male' => 'grandmother'],
            'grandfather' => ['male' => 'grandfather', 'female' => 'grandfather'],

            // Grandchildren
            'grandson' => ['male' => 'grandson', 'female' => 'granddaughter'],
            'granddaughter' => ['male' => 'grandson', 'female' => 'granddaughter'],
            'grandchild' => ['male' => 'grandson', 'female' => 'granddaughter'],

            // Aunt/Uncle
            'aunt' => ['female' => 'aunt', 'male' => 'uncle'],
            'uncle' => ['male' => 'uncle', 'female' => 'aunt'],

            // Niece/Nephew
            'niece' => ['female' => 'niece', 'male' => 'nephew'],
            'nephew' => ['male' => 'nephew', 'female' => 'niece'],

            // Cousins (no gender distinction)
            'cousin' => ['male' => 'cousin', 'female' => 'cousin'],

            // Step relationships
            'step_mother' => ['female' => 'step_mother', 'male' => 'step_father'],
            'step_father' => ['male' => 'step_father', 'female' => 'step_mother'],
            'step_sibling' => ['male' => 'step_sibling', 'female' => 'step_sibling'],
            'step_child' => ['male' => 'step_son', 'female' => 'step_daughter'],

            // In-law (same gender keeps same type, different reverses)
            'sister_in_law' => ['female' => 'sister_in_law', 'male' => 'brother_in_law'],
            'brother_in_law' => ['male' => 'brother_in_law', 'female' => 'sister_in_law'],
            'mother_in_law' => ['female' => 'mother_in_law', 'male' => 'father_in_law'],
            'father_in_law' => ['male' => 'father_in_law', 'female' => 'mother_in_law'],

            // Godparent - Godchild (typically keep reciprocal roles)
            'godparent' => ['male' => 'godparent', 'female' => 'godparent'],
            'godchild' => ['male' => 'godchild', 'female' => 'godchild'],
        ];

        // Get the appropriate label based on recipient gender
        if (isset($sameGenderMap[$relationshipType][$recipientGender])) {
            $mappedType = $sameGenderMap[$relationshipType][$recipientGender];
            $relationshipModel = RelationshipType::where('type_key', $mappedType)->first();
            return $relationshipModel?->label ?? $mappedType;
        }

        // Default fallback
        $relationshipModel = RelationshipType::where('type_key', $relationshipType)->first();
        return $relationshipModel?->label ?? $relationshipType;
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
