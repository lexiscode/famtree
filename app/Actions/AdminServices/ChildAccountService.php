<?php

namespace App\Actions\AdminServices;

use App\Models\GuestModels\User;
use App\Repositories\AdminRepositories\UserRepository;

class ChildAccountService
{
    /**
     * Create service with injected repository
     */
    public function __construct(private UserRepository $userRepository)
    {
    }

    /**
     * Get parent user details
     */
    public function getParentUser(int $parentUserId): ?array
    {
        $parent = $this->userRepository->find($parentUserId);

        if (!$parent) {
            return null;
        }

        return [
            'id' => $parent->id,
            'first_name' => $parent->first_name,
            'last_name' => $parent->last_name,
            'username' => $parent->username,
            'email' => $parent->email,
            'profile_image_url' => $parent->profile_image_url,
        ];
    }

    /**
     * Get all child accounts for a user
     */
    public function getChildAccounts(int $parentUserId): array
    {
        $children = $this->userRepository->getChildAccounts($parentUserId);

        return $children->map(function ($child) {
            return [
                'id' => $child->id,
                'first_name' => $child->first_name,
                'last_name' => $child->last_name,
                'full_name' => "{$child->first_name} {$child->last_name}",
                'username' => $child->username,
                'email' => $child->email,
                'status' => $child->status,
                'profile_image_url' => $child->profile_image_url,
                'two_fa_enabled' => $child->two_fa_enabled,
                'created_at' => $child->created_at->format('Y-m-d'),
                'created_at_formatted' => $child->created_at->diffForHumans(),
                'onboarding_completed' => $child->onboarding_completed,
            ];
        })->toArray();
    }

    /**
     * Get child account statistics for a user
     */
    public function getChildAccountStats(int $parentUserId): array
    {
        $children = $this->userRepository->getChildAccounts($parentUserId);

        $stats = [
            'total' => $children->count(),
            'active' => 0,
            'inactive' => 0,
            'suspended' => 0,
            'with_2fa' => 0,
        ];

        foreach ($children as $child) {
            if ($child->status === 'active') {
                $stats['active']++;
            } elseif ($child->status === 'inactive') {
                $stats['inactive']++;
            } elseif ($child->status === 'suspended') {
                $stats['suspended']++;
            }

            if ($child->two_fa_enabled) {
                $stats['with_2fa']++;
            }
        }

        return $stats;
    }

    /**
     * Create a new child account
     */
    public function createChildAccount(int $parentUserId, array $data): ?User
    {
        // Get parent user
        $parent = $this->userRepository->find($parentUserId);

        if (!$parent) {
            return null;
        }

        // Create child account
        $childData = [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'password' => bcrypt($data['password']),
            'parent_user_id' => $parentUserId,
            'created_by_user_id' => $parentUserId,
            'is_child_account' => true,
            'status' => 'active',
            'onboarding_completed' => false,
        ];

        // Add optional fields
        if (isset($data['phone'])) {
            $childData['phone'] = $data['phone'];
        }
        if (isset($data['bio'])) {
            $childData['bio'] = $data['bio'];
        }
        if (isset($data['date_of_birth'])) {
            $childData['date_of_birth'] = $data['date_of_birth'];
        }
        if (isset($data['gender'])) {
            $childData['gender'] = $data['gender'];
        }

        return User::create($childData);
    }

    /**
     * Update child account
     */
    public function updateChildAccount(int $childUserId, array $data): ?User
    {
        $child = $this->userRepository->find($childUserId);

        if (!$child || !$child->is_child_account) {
            return null;
        }

        $updateData = [];

        if (isset($data['first_name'])) {
            $updateData['first_name'] = $data['first_name'];
        }
        if (isset($data['last_name'])) {
            $updateData['last_name'] = $data['last_name'];
        }
        if (isset($data['phone'])) {
            $updateData['phone'] = $data['phone'];
        }
        if (isset($data['bio'])) {
            $updateData['bio'] = $data['bio'];
        }
        if (isset($data['date_of_birth'])) {
            $updateData['date_of_birth'] = $data['date_of_birth'];
        }
        if (isset($data['gender'])) {
            $updateData['gender'] = $data['gender'];
        }

        if (!empty($updateData)) {
            $this->userRepository->update($childUserId, $updateData);
        }

        return $this->userRepository->find($childUserId);
    }

    /**
     * Delete child account
     */
    public function deleteChildAccount(int $childUserId): bool
    {
        $child = $this->userRepository->find($childUserId);

        if (!$child || !$child->is_child_account) {
            return false;
        }

        return $this->userRepository->softDelete($childUserId);
    }

    /**
     * Check if a user can have child accounts
     */
    public function canHaveChildAccounts(int $userId): bool
    {
        $user = $this->userRepository->find($userId);

        if (!$user) {
            return false;
        }

        // Can't have child accounts if this is already a child account
        if ($user->is_child_account) {
            return false;
        }

        return true;
    }

    /**
     * Validate child account creation data
     */
    public function validateChildAccountData(array $data): array
    {
        $errors = [];

        if (empty($data['first_name'])) {
            $errors['first_name'] = 'First name is required';
        }

        if (empty($data['last_name'])) {
            $errors['last_name'] = 'Last name is required';
        }

        if (empty($data['username'])) {
            $errors['username'] = 'Username is required';
        } else {
            // Check if username is unique
            $existingUser = $this->userRepository->findByUsername($data['username']);
            if ($existingUser) {
                $errors['username'] = 'Username already exists';
            }
        }

        if (empty($data['email'])) {
            $errors['email'] = 'Email is required';
        } else {
            // Check if email is unique
            $existingUser = $this->userRepository->findByEmail($data['email']);
            if ($existingUser) {
                $errors['email'] = 'Email already exists';
            }
        }

        if (empty($data['password'])) {
            $errors['password'] = 'Password is required';
        } elseif (strlen($data['password']) < 8) {
            $errors['password'] = 'Password must be at least 8 characters';
        }

        return $errors;
    }

    /**
     * Get family tree for a user
     */
    public function getFamilyTree(int $userId): array
    {
        $user = $this->userRepository->find($userId);

        if (!$user) {
            return [];
        }

        $tree = [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'username' => $user->username,
                'is_child_account' => $user->is_child_account,
            ],
            'parent' => null,
            'children' => [],
        ];

        // Get parent if this is a child account
        if ($user->parent) {
            $tree['parent'] = [
                'id' => $user->parent->id,
                'first_name' => $user->parent->first_name,
                'last_name' => $user->parent->last_name,
                'username' => $user->parent->username,
            ];
        }

        // Get children
        $children = $this->userRepository->getChildAccounts($user->id);
        foreach ($children as $child) {
            $tree['children'][] = [
                'id' => $child->id,
                'first_name' => $child->first_name,
                'last_name' => $child->last_name,
                'username' => $child->username,
                'status' => $child->status,
            ];
        }

        return $tree;
    }
}
