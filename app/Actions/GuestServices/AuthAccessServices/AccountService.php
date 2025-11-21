<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AccountService
{
    /**
     * Change the user's password
     */
    public function changePassword(User $user, string $newPassword): void
    {
        $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }

    /**
     * Change the user's email address
     */
    public function changeEmail(User $user, string $newEmail): void
    {
        $user->update([
            'email' => $newEmail,
        ]);
    }

    /**
     * Soft delete the user account
     * Account will be permanently deleted after 30 days if not restored
     */
    public function deleteAccount(User $user): void
    {
        $scheduledDeletionDate = Carbon::now()->addDays(30);

        $user->update([
            'scheduled_deletion_at' => $scheduledDeletionDate,
        ]);

        $user->delete();
    }

    /**
     * Restore a soft-deleted user account
     */
    public function restoreAccount(User $user): void
    {
        $user->update([
            'scheduled_deletion_at' => null,
        ]);

        $user->restore();
    }

    /**
     * Update user profile information
     */
    public function updateProfile(User $user, array $data): void
    {
        // Fields that belong to the users table
        $userFields = [
            'phone',
            'address',
            'bio',
            'date_of_birth',
            'profile_image_url',
        ];

        $userData = [];
        foreach ($userFields as $field) {
            if (array_key_exists($field, $data)) {
                $userData[$field] = $data[$field];
            }
        }

        if (!empty($userData)) {
            $user->update($userData);
        }

        // Fields that belong to the user_family_info table
        $familyInfoFields = ['job_title' => 'current_occupation', 'education_level' => 'education_level'];
        $familyData = [];

        foreach ($familyInfoFields as $inputField => $dbField) {
            if (array_key_exists($inputField, $data)) {
                $familyData[$dbField] = $data[$inputField];
            }
        }

        if (!empty($familyData)) {
            $familyInfo = $user->familyInfo() ?? new \App\Models\GuestModels\UserFamilyInfo();
            if (!$familyInfo->user_id) {
                $familyInfo->user_id = $user->id;
            }
            $familyInfo->update($familyData);
        }
    }
}
