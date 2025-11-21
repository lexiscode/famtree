<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\ChildAccountRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Support\Str;

class ChildAccountService
{
    public function __construct(
        private ChildAccountRepository $childAccountRepository,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Create a child account
     * Only users 18+ can create child accounts
     */
    public function createChildAccount(int $parentId, array $childData): array
    {
        // Verify parent is 18+
        $parent = User::findOrFail($parentId);

        if (!$this->isParentEligible($parent)) {
            throw new \Exception('Parent must be 18 or older to create a child account.');
        }

        // Generate temporary password
        $temporaryPassword = Str::random(12);

        // Prepare child account data
        $accountData = [
            'first_name' => $childData['first_name'],
            'last_name' => $childData['last_name'],
            'username' => $childData['username'],
            'gender' => $childData['gender'],
            'email' => null, // Will be set when child comes of age
            'password' => bcrypt($temporaryPassword),
            'parent_user_id' => $parentId,
            'is_child_account' => true,
            'created_by_user_id' => $parentId,
            'status' => 'alive',
        ];

        // Create child account
        $childAccount = $this->childAccountRepository->createChildAccount($accountData);

        // Auto-create connection: parent → child (can be updated later in profile settings)
        // The relationship type can be set based on parent and child genders
        $this->connectionRepository->createConnection([
            'requester_user_id' => $parentId,
            'recipient_user_id' => $childAccount->id,
            'relationship_type' => 'son', // Default, can be changed in profile settings
            'status' => 'accepted',
            'requested_at' => now(),
            'accepted_at' => now(),
        ]);

        return [
            'child_account' => $childAccount,
            'temporary_password' => $temporaryPassword,
            'username' => $childAccount->username,
            'message' => 'Child account created successfully. Share the temporary password with your child to log in.',
        ];
    }

    /**
     * Check if parent is eligible (18+)
     */
    public function isParentEligible(User $parent): bool
    {
        if (!$parent->date_of_birth) {
            return false;
        }

        $age = now()->diffInYears($parent->date_of_birth);
        return $age >= 18;
    }

    /**
     * Get all child accounts for a parent
     */
    public function getParentChildAccounts(int $parentId): array
    {
        $childAccounts = $this->childAccountRepository->getChildAccounts($parentId);

        return $childAccounts->map(fn($child) => [
            'id' => $child->id,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'full_name' => $child->first_name . ' ' . $child->last_name,
            'username' => $child->username,
            'gender' => $child->gender,
            'email' => $child->email,
            'date_of_birth' => $child->date_of_birth,
            'profile_image_url' => $child->profile_image_url,
            'status' => $child->status,
            'age' => $child->date_of_birth ? now()->diffInYears($child->date_of_birth) : null,
            'created_at' => $child->created_at,
        ])->toArray();
    }

    /**
     * Remove a child account
     */
    public function removeChildAccount(int $parentId, int $childId): bool
    {
        // Verify the child belongs to this parent
        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child || $child->parent_user_id !== $parentId) {
            throw new \Exception('Unauthorized: Child account does not belong to this parent.');
        }

        return $this->childAccountRepository->removeChildAccount($childId);
    }

    /**
     * Set email for a child when they come of age
     * Child must be 18+ to set their own email
     */
    public function setChildEmailAtAge(int $childId, string $newEmail): array
    {
        $child = User::findOrFail($childId);

        // Verify child is actually a child account
        if (!$child->is_child_account) {
            throw new \Exception('This is not a child account.');
        }

        // Verify child is 18+
        if (!$child->date_of_birth) {
            throw new \Exception('Date of birth is required to set email.');
        }

        $age = now()->diffInYears($child->date_of_birth);
        if ($age < 18) {
            throw new \Exception('Child must be 18 years old to set their own email.');
        }

        // Check if email is already taken
        if ($this->emailExists($newEmail, $childId)) {
            throw new \Exception('Email is already taken.');
        }

        // Update child's email
        $child->email = $newEmail;
        $child->save();

        return [
            'success' => true,
            'message' => 'Email has been set successfully.',
            'child' => [
                'id' => $child->id,
                'username' => $child->username,
                'email' => $child->email,
            ],
        ];
    }

    /**
     * Check if email exists (excluding the given user)
     */
    private function emailExists(string $email, int $excludeUserId): bool
    {
        return User::where('email', $email)
            ->where('id', '!=', $excludeUserId)
            ->exists();
    }

    /**
     * Validate child account creation data
     */
    public function validateChildAccountData(array $data): array
    {
        $errors = [];

        // Validate first name
        if (empty($data['first_name'])) {
            $errors['first_name'] = 'First name is required.';
        }

        // Validate last name
        if (empty($data['last_name'])) {
            $errors['last_name'] = 'Last name is required.';
        }

        // Validate username
        if (empty($data['username'])) {
            $errors['username'] = 'Username is required.';
        } elseif (!$this->childAccountRepository->isUsernameAvailable($data['username'])) {
            $errors['username'] = 'Username is already taken.';
        } elseif (strlen($data['username']) < 3) {
            $errors['username'] = 'Username must be at least 3 characters.';
        }

        // Validate date of birth
        if (empty($data['date_of_birth'])) {
            $errors['date_of_birth'] = 'Date of birth is required.';
        }

        return $errors;
    }

    /**
     * Check if user can manage child accounts
     */
    public function canManageChildAccounts(User $user): bool
    {
        return $this->isParentEligible($user);
    }

    /**
     * Get child account with parent info
     */
    public function getChildAccountDetails(int $childId): ?array
    {
        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child) {
            return null;
        }

        $parent = $this->childAccountRepository->getParent($childId);

        return [
            'id' => $child->id,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'full_name' => $child->first_name . ' ' . $child->last_name,
            'username' => $child->username,
            'gender' => $child->gender,
            'email' => $child->email,
            'date_of_birth' => $child->date_of_birth,
            'age' => $child->date_of_birth ? now()->diffInYears($child->date_of_birth) : null,
            'profile_image_url' => $child->profile_image_url,
            'status' => $child->status,
            'created_at' => $child->created_at,
            'parent' => $parent ? [
                'id' => $parent->id,
                'first_name' => $parent->first_name,
                'last_name' => $parent->last_name,
                'username' => $parent->username,
            ] : null,
        ];
    }
}
