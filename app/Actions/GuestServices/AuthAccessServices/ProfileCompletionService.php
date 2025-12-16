<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;

class ProfileCompletionService
{
    /**
     * Calculate profile completion percentage based on essential fields
     *
     * @param User $user
     * @return array
     */
    public function getProfileCompletion(User $user): array
    {
        // Load family info relationship if not already loaded
        if (!$user->relationLoaded('familyInfo')) {
            $user->load('familyInfo');
        }

        // Define essential fields to track (9 fields total)
        $fields = [
            'profile_image' => [
                'label' => 'Profile Picture',
                'value' => $user->profile_image_url,
                'model' => 'user'
            ],
            'bio' => [
                'label' => 'Biography',
                'value' => $user->bio,
                'model' => 'user'
            ],
            'date_of_birth' => [
                'label' => 'Date of Birth',
                'value' => $user->date_of_birth,
                'model' => 'user'
            ],
            'gender' => [
                'label' => 'Gender',
                'value' => $user->gender,
                'model' => 'user'
            ],
            'phone' => [
                'label' => 'Phone Number',
                'value' => $user->phone,
                'model' => 'user'
            ],
            'family_status' => [
                'label' => 'Relationship Status',
                'value' => $user->familyInfo?->family_status,
                'model' => 'familyInfo'
            ],
            'country' => [
                'label' => 'Country',
                'value' => $user->familyInfo?->country,
                'model' => 'familyInfo'
            ],
            'state' => [
                'label' => 'State/Province',
                'value' => $user->familyInfo?->state_province,
                'model' => 'familyInfo'
            ],
            'city' => [
                'label' => 'City',
                'value' => $user->familyInfo?->city,
                'model' => 'familyInfo'
            ],
        ];

        $completedFields = [];
        $missingFields = [];

        // Check each field for completion
        foreach ($fields as $key => $field) {
            if (!empty($field['value']) && $field['value'] !== null) {
                $completedFields[] = [
                    'key' => $key,
                    'label' => $field['label']
                ];
            } else {
                $missingFields[] = [
                    'key' => $key,
                    'label' => $field['label']
                ];
            }
        }

        $totalCount = count($fields);
        $completedCount = count($completedFields);
        $percentage = $totalCount > 0 ? round(($completedCount / $totalCount) * 100) : 0;

        return [
            'percentage' => $percentage,
            'completed_count' => $completedCount,
            'total_count' => $totalCount,
            'completed_fields' => $completedFields,
            'missing_fields' => $missingFields,
        ];
    }
}
