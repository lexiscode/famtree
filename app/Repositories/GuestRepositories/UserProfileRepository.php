<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\User;

class UserProfileRepository
{
    /**
     * Get user profile by ID
     */
    public function getProfile(int $userId): ?User
    {
        return User::find($userId);
    }

    /**
     * Get user profile by username
     */
    public function getProfileByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Get user profile by email
     */
    public function getProfileByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Update user profile
     */
    public function updateProfile(int $userId, array $data): ?User
    {
        $user = $this->getProfile($userId);

        if (!$user) {
            return null;
        }

        $user->update($data);

        return $user;
    }

    /**
     * Update profile image
     */
    public function updateProfileImage(int $userId, string $imageUrl): ?User
    {
        return $this->updateProfile($userId, ['profile_image_url' => $imageUrl]);
    }

    /**
     * Mark user as deceased
     */
    public function markAsDeceased(int $userId): ?User
    {
        return $this->updateProfile($userId, ['status' => 'deceased']);
    }

    /**
     * Mark user as alive
     */
    public function markAsAlive(int $userId): ?User
    {
        return $this->updateProfile($userId, ['status' => 'alive']);
    }

    /**
     * Complete onboarding for user
     */
    public function completeOnboarding(int $userId): ?User
    {
        return $this->updateProfile($userId, ['onboarding_completed' => true]);
    }

    /**
     * Get user's child accounts
     */
    public function getChildAccounts(int $userId)
    {
        return User::where('parent_user_id', $userId)->get();
    }

    /**
     * Create child account
     */
    public function createChildAccount(int $parentId, array $data): ?User
    {
        $data['parent_user_id'] = $parentId;
        $data['is_child_account'] = true;
        $data['created_by_user_id'] = $parentId;
        $data['onboarding_completed'] = false;

        return User::create($data);
    }

    /**
     * Search users by name, username, or email
     */
    public function searchUsers(string $query, int $limit = 20)
    {
        return User::where(function ($q) use ($query) {
            $q->where('first_name', 'like', "%$query%")
              ->orWhere('last_name', 'like', "%$query%")
              ->orWhere('username', 'like', "%$query%")
              ->orWhere('email', 'like', "%$query%");
        })
        ->limit($limit)
        ->get();
    }

    /**
     * Get user's profile data for display (without sensitive info)
     */
    public function getProfileDataForDisplay(int $userId): ?array
    {
        $user = $this->getProfile($userId);

        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'bio' => $user->bio,
            'phone' => $user->phone,
            'address' => $user->address,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
        ];
    }
}
