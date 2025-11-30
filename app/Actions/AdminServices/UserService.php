<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\UserRepository;
use Illuminate\Pagination\Paginator;

class UserService
{
    /**
     * Create service with injected repository
     */
    public function __construct(private UserRepository $userRepository)
    {
    }

    /**
     * Get all users with pagination
     */
    public function getAllUsers(int $perPage = 15, int $page = 1)
    {
        return $this->userRepository->getAllPaginated($perPage, $page)->through(function ($user) {
            return $this->formatUserForList($user);
        });
    }

    /**
     * Search users by query
     */
    public function searchUsers(string $query, int $perPage = 15, int $page = 1)
    {
        return $this->userRepository->search($query, $perPage, $page)->through(function ($user) {
            return $this->formatUserForList($user);
        });
    }

    /**
     * Get filtered users based on criteria
     */
    public function getFilteredUsers(array $filters, int $perPage = 15, int $page = 1)
    {
        return $this->userRepository->filterByCriteria($filters, $perPage, $page)->through(function ($user) {
            return $this->formatUserForList($user);
        });
    }

    /**
     * Get user details with relationships
     */
    public function getUserDetails(int $userId): ?array
    {
        $user = $this->userRepository->find($userId);

        if (!$user) {
            return null;
        }

        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
            'death_date' => $user->death_date?->format('Y-m-d'),
            'gender' => $user->gender,
            'status' => $user->status,
            'account_status' => $user->account_status,
            'profile_image_url' => $user->profile_image_url,
            'two_fa_enabled' => $user->two_fa_enabled,
            'onboarding_completed' => $user->onboarding_completed,
            'is_child_account' => $user->is_child_account,
            'parent_user_id' => $user->parent_user_id,
            'created_at' => $user->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
            'deleted_at' => $user->deleted_at?->format('Y-m-d H:i:s'),
            'scheduled_deletion_at' => $user->scheduled_deletion_at?->format('Y-m-d H:i:s'),
            'childrenCount' => $user->children()->count(),
            'connectionsCount' => $user->allConnections()->count(),
        ];
    }

    /**
     * Get summary statistics for users
     */
    public function getUserStatistics(): array
    {
        return [
            'total' => $this->userRepository->count(),
            'active' => $this->userRepository->countByStatus('active'),
            'inactive' => $this->userRepository->countByStatus('inactive'),
            'suspended' => $this->userRepository->countByStatus('suspended'),
            'deleted' => $this->userRepository->getDeletedCount(),
            'with_2fa' => $this->getTwoFAEnabledCount(),
            'child_accounts' => $this->getChildAccountCount(),
        ];
    }

    /**
     * Get count of users with 2FA enabled
     */
    private function getTwoFAEnabledCount(): int
    {
        return \App\Models\GuestModels\User::where('two_fa_enabled', true)->count();
    }

    /**
     * Get count of child accounts
     */
    private function getChildAccountCount(): int
    {
        return \App\Models\GuestModels\User::where('is_child_account', true)->count();
    }

    /**
     * Format user data for list view
     */
    private function formatUserForList($user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'full_name' => "{$user->first_name} {$user->last_name}",
            'username' => $user->username,
            'email' => $user->email,
            'status' => $user->status,
            'account_status' => $user->account_status,
            'profile_image_url' => $user->profile_image_url,
            'two_fa_enabled' => $user->two_fa_enabled,
            'is_child_account' => $user->is_child_account,
            'created_at' => $user->created_at->format('Y-m-d'),
            'created_at_formatted' => $user->created_at->diffForHumans(),
            'updated_at' => $user->updated_at->format('Y-m-d'),
            'onboarding_completed' => $user->onboarding_completed,
        ];
    }
}
