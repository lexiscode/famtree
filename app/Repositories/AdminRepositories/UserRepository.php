<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\User;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository
{
    /**
     * Get all users with pagination
     */
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return User::paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Search users by name, email, or username
     */
    public function search(string $query, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return User::where('first_name', 'like', "%{$query}%")
            ->orWhere('last_name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->orWhere('username', 'like', "%{$query}%")
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Filter users by account status
     */
    public function filterByStatus(string $status, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return User::where('account_status', $status)
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Filter users by multiple criteria
     */
    public function filterByCriteria(array $filters, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = User::query();

        // Search filter
        if (isset($filters['search']) && !empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('username', 'like', "%{$search}%");
            });
        }

        // Account status filter
        if (isset($filters['status']) && !empty($filters['status'])) {
            $query->where('account_status', $filters['status']);
        }

        // 2FA enabled filter
        if (isset($filters['twoFaEnabled']) && $filters['twoFaEnabled'] !== null) {
            // Handle string 'false' and 'true' from query string
            $is2FAEnabled = $filters['twoFaEnabled'] === 'true' || $filters['twoFaEnabled'] === true;
            $query->where('two_fa_enabled', $is2FAEnabled);
        }

        // Child account filter
        if (isset($filters['isChildAccount']) && $filters['isChildAccount'] !== null) {
            // Handle string 'false' and 'true' from query string
            $isChild = $filters['isChildAccount'] === 'true' || $filters['isChildAccount'] === true;
            $query->where('is_child_account', $isChild);
        }

        // Date range filter (created_at)
        if (isset($filters['dateFrom']) && !empty($filters['dateFrom'])) {
            $query->whereDate('created_at', '>=', $filters['dateFrom']);
        }

        if (isset($filters['dateTo']) && !empty($filters['dateTo'])) {
            $query->whereDate('created_at', '<=', $filters['dateTo']);
        }

        // Onboarding completed filter
        if (isset($filters['onboardingCompleted']) && $filters['onboardingCompleted'] !== null) {
            $query->where('onboarding_completed', (bool)$filters['onboardingCompleted']);
        }

        // Sort
        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get user by ID
     */
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Get user by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Get user by username
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Get total user count
     */
    public function count(): int
    {
        return User::count();
    }

    /**
     * Get count by account status
     */
    public function countByStatus(string $status): int
    {
        return User::where('account_status', $status)->count();
    }

    /**
     * Update user
     */
    public function update(int $id, array $data): ?User
    {
        $user = $this->find($id);
        if ($user) {
            $user->update($data);
        }
        return $user;
    }

    /**
     * Get child accounts for a user
     */
    public function getChildAccounts(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return User::where('parent_user_id', $userId)->get();
    }

    /**
     * Get users with scheduled deletion
     */
    public function getScheduledForDeletion(): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereNotNull('scheduled_deletion_at')
            ->where('scheduled_deletion_at', '<=', now())
            ->get();
    }

    /**
     * Soft delete user
     */
    public function softDelete(int $id): bool
    {
        $user = $this->find($id);
        return $user ? $user->delete() : false;
    }

    /**
     * Get deleted users count
     */
    public function getDeletedCount(): int
    {
        return User::onlyTrashed()->count();
    }
}
