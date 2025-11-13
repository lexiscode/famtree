<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\Family;
use Illuminate\Pagination\LengthAwarePaginator;

class FamilyRepository
{
    /**
     * Get all public families with pagination
     */
    public function paginate(int $perPage = 12): LengthAwarePaginator
    {
        return Family::where('is_public', true)
            ->paginate($perPage);
    }

    /**
     * Search families by name or state
     */
    public function search(string $query, int $perPage = 12): LengthAwarePaginator
    {
        return Family::where('is_public', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('state', 'like', "%{$query}%")
                    ->orWhere('village', 'like', "%{$query}%");
            })
            ->paginate($perPage);
    }

    /**
     * Filter families by state
     */
    public function filterByState(string $state, int $perPage = 12): LengthAwarePaginator
    {
        return Family::where('is_public', true)
            ->where('state', $state)
            ->paginate($perPage);
    }

    /**
     * Get all unique states for filter dropdown
     */
    public function getAllStates(): array
    {
        return Family::where('is_public', true)
            ->distinct('state')
            ->orderBy('state')
            ->pluck('state')
            ->toArray();
    }

    /**
     * Sort families by various criteria
     */
    public function sortAndFilter(
        ?string $search = null,
        ?string $state = null,
        string $sortBy = 'name',
        int $perPage = 12
    ): LengthAwarePaginator {
        $query = Family::where('is_public', true);

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('state', 'like', "%{$search}%")
                    ->orWhere('village', 'like', "%{$search}%");
            });
        }

        // Apply state filter
        if ($state) {
            $query->where('state', $state);
        }

        // Apply sorting
        if ($sortBy === 'members') {
            $query->orderBy('member_count', 'desc');
        } elseif ($sortBy === 'active') {
            $query->orderBy('updated_at', 'desc');
        } elseif ($sortBy === 'alphabet') {
            $query->orderBy('name', 'asc');
        } else {
            $query->orderBy('name', 'asc'); // name is default
        }

        return $query->paginate($perPage);
    }

    /**
     * Get a single family by slug
     */
    public function findBySlug(string $slug): ?Family
    {
        return Family::where('slug', $slug)
            ->where('is_public', true)
            ->first();
    }

    /**
     * Get a single family by ID
     */
    public function find(int $id): ?Family
    {
        return Family::where('is_public', true)
            ->find($id);
    }

    /**
     * Get all public families
     */
    public function all()
    {
        return Family::where('is_public', true)
            ->orderBy('name')
            ->get();
    }
}
