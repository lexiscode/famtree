<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminModels\PublicPage;
use Illuminate\Pagination\LengthAwarePaginator;

class PublicPageRepository
{
    /**
     * Get all pages with pagination
     */
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return PublicPage::with('createdBy')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find a page by ID
     */
    public function find(int $id): ?PublicPage
    {
        return PublicPage::with('createdBy')->find($id);
    }

    /**
     * Create a new page
     */
    public function create(array $data): PublicPage
    {
        return PublicPage::create($data);
    }

    /**
     * Update a page
     */
    public function update(int $id, array $data): ?PublicPage
    {
        $page = PublicPage::find($id);
        if ($page) {
            $page->update($data);
        }
        return $page;
    }

    /**
     * Delete a page
     */
    public function delete(int $id): bool
    {
        $page = PublicPage::find($id);
        return $page ? $page->delete() : false;
    }

    /**
     * Find a page by slug
     */
    public function findBySlug(string $slug): ?PublicPage
    {
        return PublicPage::with('createdBy')->where('slug', $slug)->first();
    }

    /**
     * Get total page count
     */
    public function count(): int
    {
        return PublicPage::count();
    }

    /**
     * Get published page count
     */
    public function countPublished(): int
    {
        return PublicPage::published()->count();
    }

    /**
     * Get draft page count
     */
    public function countDrafts(): int
    {
        return PublicPage::draft()->count();
    }
}
