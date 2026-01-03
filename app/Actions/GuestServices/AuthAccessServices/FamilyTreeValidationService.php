<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Carbon\Carbon;

class FamilyTreeValidationService
{
    public function __construct(
        private UserConnectionRepository $userConnectionRepository
    ) {}

    /**
     * Validate if a user can create a family tree
     *
     * Requirements:
     * 1. Gender must be 'male'
     * 2. Age must be 18+ years old
     * 3. Must have accepted connection of type wife/husband OR son/daughter
     *
     * @param User $user
     * @return array ['can_create' => bool, 'errors' => array]
     */
    public function canCreateFamilyTree(User $user): array
    {
        $errors = [];

        // Requirement 1: Must be male
        if ($user->gender !== 'male') {
            $errors[] = 'Only male users can create family trees.';
        }

        // Requirement 2: Must be at least 18 years old
        if (!$this->isAtLeast18YearsOld($user)) {
            $errors[] = 'You must be at least 18 years old to create a family tree.';
        }

        // Requirement 3: Must have nuclear family connections
        if (!$this->hasNuclearFamilyConnections($user->id)) {
            $errors[] = 'You must have at least one accepted connection with your spouse or child to create a family tree.';
        }

        return [
            'can_create' => count($errors) === 0,
            'errors' => $errors,
        ];
    }

    /**
     * Check if user is at least 18 years old
     *
     * @param User $user
     * @return bool
     */
    public function isAtLeast18YearsOld(User $user): bool
    {
        if (!$user->date_of_birth) {
            return false;
        }

        $age = Carbon::parse($user->date_of_birth)->age;
        return $age >= 18;
    }

    /**
     * Check if user has nuclear family connections (spouse or children)
     *
     * @param int $userId
     * @return bool
     */
    public function hasNuclearFamilyConnections(int $userId): bool
    {
        // Check for spouse connections
        $spouseTypes = ['wife', 'husband'];
        foreach ($spouseTypes as $type) {
            $connections = $this->userConnectionRepository->getConnectionsByType($userId, $type);
            if ($connections->isNotEmpty()) {
                return true;
            }
        }

        // Check for child connections
        $childTypes = ['son', 'daughter'];
        foreach ($childTypes as $type) {
            $connections = $this->userConnectionRepository->getConnectionsByType($userId, $type);
            if ($connections->isNotEmpty()) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get nuclear family member IDs for a user (spouse and children) with their roles
     *
     * Returns an array of arrays: [
     *   ['user_id' => 123, 'role' => 'spouse'],
     *   ['user_id' => 456, 'role' => 'child']
     * ]
     *
     * @param int $userId
     * @return array
     */
    public function getNuclearFamilyMemberIds(int $userId): array
    {
        $members = [];
        $addedUserIds = []; // Track already added users to prevent duplicates

        // Get spouse connections
        $spouseTypes = ['wife', 'husband'];
        foreach ($spouseTypes as $type) {
            $connections = $this->userConnectionRepository->getConnectionsByType($userId, $type);
            foreach ($connections as $connection) {
                $memberId = $connection->requester_user_id === $userId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;

                // Only add if not already added
                if (!in_array($memberId, $addedUserIds)) {
                    $members[] = [
                        'user_id' => $memberId,
                        'role' => 'spouse',
                    ];
                    $addedUserIds[] = $memberId;
                }
            }
        }

        // Get child connections
        $childTypes = ['son', 'daughter'];
        foreach ($childTypes as $type) {
            $connections = $this->userConnectionRepository->getConnectionsByType($userId, $type);
            foreach ($connections as $connection) {
                $memberId = $connection->requester_user_id === $userId
                    ? $connection->recipient_user_id
                    : $connection->requester_user_id;

                // Only add if not already added
                if (!in_array($memberId, $addedUserIds)) {
                    $members[] = [
                        'user_id' => $memberId,
                        'role' => 'child',
                    ];
                    $addedUserIds[] = $memberId;
                }
            }
        }

        return $members;
    }

    /**
     * Map relationship type to nuclear family role
     *
     * @param string $relationshipType
     * @return string|null 'spouse', 'child', or null if not nuclear family
     */
    public function getNuclearFamilyRole(string $relationshipType): ?string
    {
        $spouseTypes = ['wife', 'husband'];
        $childTypes = ['son', 'daughter'];

        if (in_array($relationshipType, $spouseTypes)) {
            return 'spouse';
        }

        if (in_array($relationshipType, $childTypes)) {
            return 'child';
        }

        return null;
    }

    /**
     * Get validation errors for a user without checking if they can create
     *
     * @param User $user
     * @return array
     */
    public function getValidationErrors(User $user): array
    {
        return $this->canCreateFamilyTree($user)['errors'];
    }
}
