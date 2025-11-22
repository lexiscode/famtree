<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\ProfilePrivacyRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class ProfilePrivacyService
{
    public function __construct(
        private ProfilePrivacyRepository $privacyRepository,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Check if a viewer can see a specific field on another user's profile
     *
     * @param int $viewerId - The user trying to view the field
     * @param int $ownerId - The user who owns the profile
     * @param string $fieldName - The field to check
     * @return bool
     */
    public function canUserViewField(int $viewerId, int $ownerId, string $fieldName): bool
    {
        // User can always view their own profile completely
        if ($viewerId === $ownerId) {
            return true;
        }

        // Get the privacy level for this field
        $privacyLevel = $this->privacyRepository->getPrivacySetting($ownerId, $fieldName);

        // If no custom setting, use public as default
        if (!$privacyLevel) {
            return true; // Default to public visibility
        }

        // Check based on privacy level
        return match ($privacyLevel) {
            'public' => true,
            'connected_family' => $this->isConnected($viewerId, $ownerId),
            'nuclear_family' => $this->isNuclearFamily($viewerId, $ownerId),
            'only_me' => false,
            default => false,
        };
    }

    /**
     * Check if two users are connected
     *
     * @param int $userId1
     * @param int $userId2
     * @return bool
     */
    private function isConnected(int $userId1, int $userId2): bool
    {
        // Check if they have any direct connection
        $connections = $this->connectionRepository->getConnections($userId1);

        foreach ($connections as $connection) {
            $connectedUserId = $connection->requester_user_id === $userId1
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            if ($connectedUserId === $userId2) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if two users are nuclear family (direct family members)
     * Nuclear family = parents, siblings, or children
     *
     * @param int $viewerId
     * @param int $ownerId
     * @return bool
     */
    private function isNuclearFamily(int $viewerId, int $ownerId): bool
    {
        $owner = User::find($ownerId);
        $viewer = User::find($viewerId);

        if (!$owner || !$viewer) {
            return false;
        }

        // Check if viewer is the owner's parent
        if ($viewer->id === $owner->parent_user_id) {
            return true;
        }

        // Check if owner is the viewer's parent
        if ($owner->id === $viewer->parent_user_id) {
            return true;
        }

        // Check if they have the same parent (siblings)
        if ($owner->parent_user_id && $viewer->parent_user_id && $owner->parent_user_id === $viewer->parent_user_id) {
            return true;
        }

        // Check if they are connected as parent/child via user_connections
        $relationships = $this->connectionRepository->getConnectionType($viewerId, $ownerId);
        if ($relationships) {
            foreach ($relationships as $relationship) {
                if (in_array($relationship, ['father', 'mother', 'son', 'daughter', 'brother', 'sister'])) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Get visible profile data for a viewer
     * Returns all fields the viewer is allowed to see
     *
     * @param int $viewerId
     * @param int $ownerId
     * @return array
     */
    public function getVisibleProfileData(int $viewerId, int $ownerId): array
    {
        $owner = User::find($ownerId);

        if (!$owner) {
            return [];
        }

        $availableFields = $this->privacyRepository->getAvailableFields();
        $visibleData = [];

        foreach (array_keys($availableFields) as $fieldName) {
            if ($this->canUserViewField($viewerId, $ownerId, $fieldName)) {
                // Map field names to User model properties
                $visibleData[$fieldName] = $this->getFieldValue($owner, $fieldName);
            } else {
                // Return null or placeholder for hidden fields
                $visibleData[$fieldName] = null;
            }
        }

        return $visibleData;
    }

    /**
     * Get a field value from the user model
     *
     * @param User $user
     * @param string $fieldName
     * @return mixed
     */
    private function getFieldValue(User $user, string $fieldName): mixed
    {
        return match ($fieldName) {
            'full_name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
            'phone' => $user->phone,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth,
            'bio' => $user->bio,
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
            default => null,
        };
    }

    /**
     * Get a summary of what's visible vs hidden for a profile
     *
     * @param int $viewerId
     * @param int $ownerId
     * @return array
     */
    public function getFieldVisibility(int $viewerId, int $ownerId): array
    {
        $availableFields = $this->privacyRepository->getAvailableFields();
        $visibility = [];

        foreach ($availableFields as $fieldName => $label) {
            $visibility[$fieldName] = [
                'label' => $label,
                'visible' => $this->canUserViewField($viewerId, $ownerId, $fieldName),
                'privacyLevel' => $this->privacyRepository->getPrivacySetting($ownerId, $fieldName) ?? 'public',
            ];
        }

        return $visibility;
    }

    /**
     * Get relationship level between two users for context
     * Helps determine why they can see what they can see
     *
     * @param int $viewerId
     * @param int $ownerId
     * @return string|null (parent, child, sibling, connected, public, or null)
     */
    public function getRelationshipContext(int $viewerId, int $ownerId): ?string
    {
        if ($viewerId === $ownerId) {
            return 'self';
        }

        if ($this->isNuclearFamily($viewerId, $ownerId)) {
            return 'nuclear_family';
        }

        if ($this->isConnected($viewerId, $ownerId)) {
            return 'connected';
        }

        return 'public';
    }

    /**
     * Get profile data formatted for display on the profile page
     *
     * @param int $viewerId
     * @param int $ownerId
     * @return array
     */
    public function getFormattedProfileData(int $viewerId, int $ownerId): array
    {
        $owner = User::find($ownerId);

        if (!$owner) {
            return [];
        }

        $visibleData = $this->getVisibleProfileData($viewerId, $ownerId);
        $fieldLabels = $this->privacyRepository->getAvailableFields();

        $formatted = [];

        foreach ($fieldLabels as $fieldName => $label) {
            $value = $visibleData[$fieldName] ?? null;
            $isVisible = $this->canUserViewField($viewerId, $ownerId, $fieldName);

            $formatted[$fieldName] = [
                'label' => $label,
                'value' => $value,
                'visible' => $isVisible,
            ];
        }

        return $formatted;
    }
}
