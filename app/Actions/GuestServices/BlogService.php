<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\BlogRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class BlogService
{
    public function __construct(private BlogRepository $blogRepository) {}

    /**
     * Get all blog posts with filters and search
     */
    public function getAllPosts(
        int $page = 1,
        ?string $search = null,
        ?string $category = null,
        string $sortBy = 'latest',
        int $perPage = 12
    ): LengthAwarePaginator {
        return $this->blogRepository->searchAndFilter($search, $category, $sortBy, $perPage);
    }

    /**
     * Get a single blog post by slug
     */
    public function getPostBySlug(string $slug): ?array
    {
        $post = $this->blogRepository->findBySlug($slug);

        if ($post) {
            // Increment view count
            $this->blogRepository->incrementViewCount($post->id);

            return $post->toArray();
        }

        return null;
    }

    /**
     * Get blog post with related posts
     */
    public function getPostWithRelated(string $slug): ?array
    {
        $post = $this->blogRepository->findBySlug($slug);

        if (!$post) {
            return null;
        }

        // Increment view count
        $this->blogRepository->incrementViewCount($post->id);

        $postArray = $post->toArray();
        $postArray['related'] = $this->blogRepository->getRelated($post->id, $post->category, 3);

        return $postArray;
    }

    /**
     * Get available categories
     */
    public function getCategories(): array
    {
        return $this->blogRepository->getCategories();
    }

    /**
     * Get recent posts
     */
    public function getRecentPosts(int $limit = 5): array
    {
        return $this->blogRepository->getRecent($limit);
    }

    /**
     * Get popular posts
     */
    public function getPopularPosts(int $limit = 5): array
    {
        return $this->blogRepository->getPopular($limit);
    }
}
