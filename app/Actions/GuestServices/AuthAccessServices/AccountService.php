<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;

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
    public function updateProfile(User $user, array $data, ?UploadedFile $profileImage = null): void
    {
        // Fields that belong to the users table
        $userFields = [
            'phone',
            'address',
            'bio',
            'date_of_birth',
            'gender',
        ];

        $userData = [];
        foreach ($userFields as $field) {
            if (array_key_exists($field, $data)) {
                $userData[$field] = $data[$field];
            }
        }

        // Handle profile image upload
        if ($profileImage) {
            // Delete old image if it exists
            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
            }

            // Store new image
            $path = $profileImage->store('profile-images', 'public');
            $userData['profile_image'] = $path;
            $userData['profile_image_url'] = Storage::disk('public')->url($path);
        }

        if (!empty($userData)) {
            $user->update($userData);
        }

        // Fields that belong to the user_family_info table
        $familyInfoFields = [
            'job_title' => 'current_occupation',
            'education_level' => 'education_level',
            'country' => 'country',
            'state' => 'state_province',
            'city' => 'city',
            'family_status' => 'family_status',
        ];
        $familyData = [];

        foreach ($familyInfoFields as $inputField => $dbField) {
            if (array_key_exists($inputField, $data)) {
                $familyData[$dbField] = $data[$inputField];
            }
        }

        if (!empty($familyData)) {
            // Use updateOrCreate to handle both new and existing records
            \App\Models\GuestModels\UserFamilyInfo::updateOrCreate(
                ['user_id' => $user->id],
                $familyData
            );
        }
    }

    /**
     * Update profile image only
     */
    public function updateProfileImage(User $user, UploadedFile $profileImage): void
    {
        // Delete old image if it exists
        if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
            Storage::disk('public')->delete($user->profile_image);
        }

        // Store new image
        $path = $profileImage->store('profile-images', 'public');

        $user->update([
            'profile_image' => $path,
            'profile_image_url' => Storage::disk('public')->url($path),
        ]);
    }

    /**
     * Update a single profile field
     */
    public function updateSingleField(User $user, string $field, ?string $value): void
    {
        // Fields that belong to the users table
        $userFields = ['phone', 'address', 'bio', 'date_of_birth', 'gender', 'status'];

        // Fields that belong to user_family_info table
        $familyInfoFields = [
            'job_title' => 'current_occupation',
            'education' => 'education_level',
        ];

        if (in_array($field, $userFields)) {
            $user->update([$field => $value]);
        } elseif (array_key_exists($field, $familyInfoFields)) {
            \App\Models\GuestModels\UserFamilyInfo::updateOrCreate(
                ['user_id' => $user->id],
                [$familyInfoFields[$field] => $value]
            );
        }
    }
}
