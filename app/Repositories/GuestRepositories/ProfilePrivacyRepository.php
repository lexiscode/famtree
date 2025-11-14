<?php

namespace App\Repositories\GuestRepositories;

use Illuminate\Support\Collection;

class ProfilePrivacyRepository
{
    /**
     * Get privacy setting for a specific field
     *
     * @param int $userId
     * @param string $fieldName
     * @return string|null
     */
    public function getPrivacySetting(int $userId, string $fieldName): ?string
    {
        $setting = \DB::table('user_profile_privacy')
            ->where('user_id', $userId)
            ->where('field_name', $fieldName)
            ->first();

        return $setting?->visibility_level;
    }

    /**
     * Get all privacy settings for a user
     *
     * @param int $userId
     * @return Collection
     */
    public function getPrivacySettings(int $userId): Collection
    {
        return \DB::table('user_profile_privacy')
            ->where('user_id', $userId)
            ->get()
            ->keyBy('field_name');
    }

    /**
     * Set privacy level for a field
     *
     * @param int $userId
     * @param string $fieldName
     * @param string $visibilityLevel (public, connected_family, nuclear_family, only_me)
     * @return void
     */
    public function setPrivacy(int $userId, string $fieldName, string $visibilityLevel): void
    {
        \DB::table('user_profile_privacy')
            ->updateOrInsert(
                [
                    'user_id' => $userId,
                    'field_name' => $fieldName,
                ],
                [
                    'visibility_level' => $visibilityLevel,
                    'updated_at' => now(),
                ]
            );
    }

    /**
     * Set multiple privacy settings at once
     *
     * @param int $userId
     * @param array $settings ['field_name' => 'visibility_level', ...]
     * @return void
     */
    public function setMultiplePrivacy(int $userId, array $settings): void
    {
        foreach ($settings as $fieldName => $visibilityLevel) {
            $this->setPrivacy($userId, $fieldName, $visibilityLevel);
        }
    }

    /**
     * Get default privacy settings for a new user
     *
     * @return array
     */
    public function getDefaultPrivacySettings(): array
    {
        return [
            'full_name' => 'public',
            'phone' => 'nuclear_family',
            'address' => 'nuclear_family',
            'date_of_birth' => 'connected_family',
            'bio' => 'public',
            'job_title' => 'public',
            'education' => 'public',
            'profile_image_url' => 'public',
            'status' => 'public',
        ];
    }

    /**
     * Initialize default privacy settings for a user
     *
     * @param int $userId
     * @return void
     */
    public function initializeDefaults(int $userId): void
    {
        $defaults = $this->getDefaultPrivacySettings();

        foreach ($defaults as $fieldName => $visibilityLevel) {
            $this->setPrivacy($userId, $fieldName, $visibilityLevel);
        }
    }

    /**
     * Delete privacy setting for a field
     *
     * @param int $userId
     * @param string $fieldName
     * @return void
     */
    public function deletePrivacy(int $userId, string $fieldName): void
    {
        \DB::table('user_profile_privacy')
            ->where('user_id', $userId)
            ->where('field_name', $fieldName)
            ->delete();
    }

    /**
     * Delete all privacy settings for a user
     *
     * @param int $userId
     * @return void
     */
    public function deleteAllPrivacy(int $userId): void
    {
        \DB::table('user_profile_privacy')
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Check if user has any custom privacy settings
     *
     * @param int $userId
     * @return bool
     */
    public function hasCustomSettings(int $userId): bool
    {
        return \DB::table('user_profile_privacy')
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Get all available fields that can have privacy settings
     *
     * @return array
     */
    public function getAvailableFields(): array
    {
        return [
            'full_name' => 'Full Name',
            'phone' => 'Phone Number',
            'address' => 'Address',
            'date_of_birth' => 'Date of Birth',
            'bio' => 'Bio',
            'job_title' => 'Job Title',
            'education' => 'Education',
            'profile_image_url' => 'Profile Picture',
            'status' => 'Alive/Deceased Status',
        ];
    }

    /**
     * Get visibility level descriptions
     *
     * @return array
     */
    public function getVisibilityLevelDescriptions(): array
    {
        return [
            'public' => 'Everyone (including those not connected)',
            'connected_family' => 'Only people you\'re connected to',
            'nuclear_family' => 'Only direct family (parents, siblings, children)',
            'only_me' => 'Only you can see this',
        ];
    }
}
