<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\UserProfileRepository;
use App\Models\GuestModels\User;
use Illuminate\Validation\ValidationException;

class UserProfileService
{
    public function __construct(private UserProfileRepository $userProfileRepository)
    {
    }

    /**
     * Get user profile
     */
    public function getProfile(int $userId): ?User
    {
        return $this->userProfileRepository->getProfile($userId);
    }

    /**
     * Get user profile by username
     */
    public function getProfileByUsername(string $username): ?User
    {
        return $this->userProfileRepository->getProfileByUsername($username);
    }

    /**
     * Update user profile
     */
    public function updateProfile(int $userId, array $data): ?User
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Only allow updating own profile or by admin (future)
        return $this->userProfileRepository->updateProfile($userId, $data);
    }

    /**
     * Update profile with image
     */
    public function updateProfileWithImage(int $userId, array $data, ?string $imageUrl = null): ?User
    {
        if ($imageUrl) {
            $data['profile_image_url'] = $imageUrl;
        }

        return $this->updateProfile($userId, $data);
    }

    /**
     * Mark user as deceased (only nuclear family can do this)
     */
    public function markAsDeceased(int $userId, int $requestingUserId): ?User
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Check if requesting user is authorized (nuclear family member or themselves)
        $isAuthorized = $userId === $requestingUserId ||
                       $this->isNuclearFamilyMember($requestingUserId, $userId);

        if (!$isAuthorized) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to change this user\'s status'],
            ]);
        }

        return $this->userProfileRepository->markAsDeceased($userId);
    }

    /**
     * Mark user as alive
     */
    public function markAsAlive(int $userId, int $requestingUserId): ?User
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Check if requesting user is authorized
        $isAuthorized = $userId === $requestingUserId ||
                       $this->isNuclearFamilyMember($requestingUserId, $userId);

        if (!$isAuthorized) {
            throw ValidationException::withMessages([
                'authorization' => ['You are not authorized to change this user\'s status'],
            ]);
        }

        return $this->userProfileRepository->markAsAlive($userId);
    }

    /**
     * Complete onboarding
     */
    public function completeOnboarding(int $userId): ?User
    {
        return $this->userProfileRepository->completeOnboarding($userId);
    }

    /**
     * Create child account
     */
    public function createChildAccount(int $parentId, array $data): ?User
    {
        $parent = $this->userProfileRepository->getProfile($parentId);

        if (!$parent) {
            throw ValidationException::withMessages([
                'parent' => ['Parent user not found'],
            ]);
        }

        // Parent must be at least 18 years old (future: calculate from date_of_birth)

        // Validate child data
        if (empty($data['first_name']) || empty($data['last_name']) || empty($data['username'])) {
            throw ValidationException::withMessages([
                'first_name' => ['First name is required'],
                'last_name' => ['Last name is required'],
                'username' => ['Username is required'],
            ]);
        }

        // Check if username already exists
        if ($this->userProfileRepository->getProfileByUsername($data['username'])) {
            throw ValidationException::withMessages([
                'username' => ['This username is already taken'],
            ]);
        }

        return $this->userProfileRepository->createChildAccount($parentId, $data);
    }

    /**
     * Get user's child accounts
     */
    public function getChildAccounts(int $userId)
    {
        return $this->userProfileRepository->getChildAccounts($userId);
    }

    /**
     * Search for users
     */
    public function searchUsers(string $query, int $limit = 20)
    {
        if (strlen($query) < 2) {
            throw ValidationException::withMessages([
                'query' => ['Search query must be at least 2 characters'],
            ]);
        }

        return $this->userProfileRepository->searchUsers($query, $limit);
    }

    /**
     * Check if user is nuclear family member
     * Nuclear family: parents, siblings, children (future implementation with connections)
     */
    private function isNuclearFamilyMember(int $userId, int $targetUserId): bool
    {
        // This will be implemented fully in Phase 3 (Connections)
        // For now, return false
        // Future: Check user_connections table for parent/sibling/child relationships
        return false;
    }

    /**
     * Get profile data for display (respects privacy settings)
     */
    public function getProfileDataForDisplay(int $userId): ?array
    {
        return $this->userProfileRepository->getProfileDataForDisplay($userId);
    }
}
