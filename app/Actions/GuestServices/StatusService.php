<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Support\Facades\DB;

class StatusService
{
    public function __construct(
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Update user status (Alive/Deceased)
     * Only certain users can update status:
     * - User themselves
     * - Their nuclear family members (parents, siblings, children)
     */
    public function updateStatus(int $userId, int $requesterId, string $newStatus, ?string $deathDate = null): array
    {
        // Verify status is valid
        if (!in_array($newStatus, ['alive', 'deceased'])) {
            throw new \Exception('Invalid status. Must be either "alive" or "deceased".');
        }

        // Get the user whose status is being updated
        $user = User::findOrFail($userId);

        // Check authorization
        if (!$this->canUpdateStatus($userId, $requesterId)) {
            throw new \Exception('You do not have permission to update this user\'s status.');
        }

        // If marking as deceased, ensure death date is provided
        if ($newStatus === 'deceased' && !$deathDate) {
            throw new \Exception('Death date is required when marking user as deceased.');
        }

        // Validate death date if provided
        if ($deathDate) {
            $this->validateDeathDate($user, $deathDate);
        }

        // Update status
        $user->status = $newStatus;
        if ($deathDate) {
            $user->death_date = $deathDate;
        } elseif ($newStatus === 'alive') {
            $user->death_date = null;
        }
        $user->save();

        return [
            'success' => true,
            'message' => 'Status updated successfully.',
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'status' => $user->status,
                'death_date' => $user->death_date?->format('Y-m-d'),
            ],
        ];
    }

    /**
     * Check if requester can update a user's status
     */
    private function canUpdateStatus(int $userId, int $requesterId): bool
    {
        // User can always update their own status
        if ($userId === $requesterId) {
            return true;
        }

        // Get the user whose status is being updated
        $user = User::find($userId);
        if (!$user) {
            return false;
        }

        // Check if requester is nuclear family member
        return $this->isNuclearFamilyMember($userId, $requesterId);
    }

    /**
     * Check if requester is a nuclear family member of the user
     * Nuclear family: parents, children, siblings
     */
    private function isNuclearFamilyMember(int $userId, int $requesterId): bool
    {
        $user = User::find($userId);
        $requester = User::find($requesterId);

        if (!$user || !$requester) {
            return false;
        }

        // Check if requester is parent
        if ($user->parent_user_id === $requesterId) {
            return true;
        }

        // Check if requester is child of the user
        if ($requester->parent_user_id === $userId) {
            return true;
        }

        // Check if they are siblings (share same parent)
        if ($user->parent_user_id && $user->parent_user_id === $requester->parent_user_id) {
            return true;
        }

        // Check connections for parents, children, siblings
        $nuclearRelationships = ['father', 'mother', 'son', 'daughter', 'brother', 'sister'];

        $connectionExists = DB::table('user_connections')
            ->where(function ($query) use ($userId, $requesterId, $nuclearRelationships) {
                $query->where('requester_user_id', $userId)
                    ->where('recipient_user_id', $requesterId)
                    ->whereIn('relationship_type', $nuclearRelationships)
                    ->where('status', 'accepted');
            })
            ->orWhere(function ($query) use ($userId, $requesterId, $nuclearRelationships) {
                $query->where('requester_user_id', $requesterId)
                    ->where('recipient_user_id', $userId)
                    ->whereIn('relationship_type', $nuclearRelationships)
                    ->where('status', 'accepted');
            })
            ->exists();

        return $connectionExists;
    }

    /**
     * Validate death date
     */
    private function validateDeathDate(User $user, string $deathDate): void
    {
        // Parse the date
        try {
            $death = \Carbon\Carbon::parse($deathDate);
        } catch (\Exception $e) {
            throw new \Exception('Invalid date format for death date.');
        }

        // Death date cannot be in the future
        if ($death->isFuture()) {
            throw new \Exception('Death date cannot be in the future.');
        }

        // Death date cannot be before birth
        if ($user->date_of_birth && $death->isBefore($user->date_of_birth)) {
            throw new \Exception('Death date cannot be before birth date.');
        }

        // Death date should be reasonable (not too far in the past)
        $birthYear = $user->date_of_birth ? $user->date_of_birth->year : null;
        if ($birthYear && ($death->year - $birthYear) > 150) {
            throw new \Exception('Death date appears to be invalid. Please verify.');
        }
    }

    /**
     * Get user status with formatted information
     */
    public function getUserStatus(int $userId): array
    {
        $user = User::findOrFail($userId);

        $ageAtDeath = null;
        if ($user->death_date && $user->date_of_birth) {
            $ageAtDeath = $user->death_date->diffInYears($user->date_of_birth);
        }

        return [
            'id' => $user->id,
            'status' => $user->status,
            'death_date' => $user->death_date?->format('Y-m-d'),
            'death_date_formatted' => $user->death_date?->format('M d, Y'),
            'is_deceased' => $user->status === 'deceased',
            'is_alive' => $user->status === 'alive',
            'age_at_death' => $ageAtDeath,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
        ];
    }

    /**
     * Get users with deceased status
     */
    public function getDeceasedUsers(int $limit = 50)
    {
        return User::where('status', 'deceased')
            ->whereNotNull('death_date')
            ->orderBy('death_date', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn($user) => $this->getUserStatus($user->id));
    }

    /**
     * Check if user is deceased
     */
    public function isDeceased(int $userId): bool
    {
        return User::where('id', $userId)
            ->where('status', 'deceased')
            ->exists();
    }
}
