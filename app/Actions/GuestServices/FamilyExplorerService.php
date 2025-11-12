<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\FamilyRepository;

class FamilyExplorerService
{
    public function __construct(private FamilyRepository $familyRepository)
    {
    }

    /**
     * Get paginated families with optional search and filters
     */
    public function getFamilies(
        ?string $search = null,
        ?string $state = null,
        string $sortBy = 'name',
        int $page = 1,
        int $perPage = 12
    ) {
        // Use repository method to get families with filters and sorting
        $families = $this->familyRepository->sortAndFilter(
            search: $search,
            state: $state,
            sortBy: $sortBy,
            perPage: $perPage
        );

        return $families;
    }

    /**
     * Get all available states for the filter dropdown
     */
    public function getAvailableStates(): array
    {
        return $this->familyRepository->getAllStates();
    }

    /**
     * Get a single family by slug
     */
    public function getFamilyBySlug(string $slug)
    {
        return $this->familyRepository->findBySlug($slug);
    }
}
