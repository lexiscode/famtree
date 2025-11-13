<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\BlogPost;
use Illuminate\Pagination\LengthAwarePaginator;

class BlogRepository
{
    /**
     * Get all published blog posts with pagination
     */
    public function paginate(int $perPage = 12): LengthAwarePaginator
    {
        return BlogPost::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Search blog posts by title, excerpt, or content
     */
    public function search(string $query, int $perPage = 12): LengthAwarePaginator
    {
        return BlogPost::where('is_published', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                    ->orWhere('excerpt', 'LIKE', "%{$query}%")
                    ->orWhere('content', 'LIKE', "%{$query}%");
            })
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Filter blog posts by category
     */
    public function filterByCategory(string $category, int $perPage = 12): LengthAwarePaginator
    {
        return BlogPost::where('is_published', true)
            ->where('category', $category)
            ->orderBy('published_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Combined search, filter, and sort
     */
    public function searchAndFilter(?string $search, ?string $category, string $sortBy = 'latest', int $perPage = 12): LengthAwarePaginator
    {
        $query = BlogPost::where('is_published', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'LIKE', "%{$search}%")
                    ->orWhere('excerpt', 'LIKE', "%{$search}%")
                    ->orWhere('content', 'LIKE', "%{$search}%");
            });
        }

        if ($category && $category !== 'All') {
            $query->where('category', $category);
        }

        if ($sortBy === 'popular') {
            $query->orderBy('view_count', 'desc');
        } elseif ($sortBy === 'oldest') {
            $query->orderBy('published_at', 'asc');
        } else {
            $query->orderBy('published_at', 'desc');
        }

        return $query->paginate($perPage);
    }

    /**
     * Find blog post by slug
     */
    public function findBySlug(string $slug): ?BlogPost
    {
        return BlogPost::where('slug', $slug)
            ->where('is_published', true)
            ->first();
    }

    /**
     * Find blog post by ID
     */
    public function find(int $id): ?BlogPost
    {
        return BlogPost::where('id', $id)
            ->where('is_published', true)
            ->first();
    }

    /**
     * Get recent blog posts
     */
    public function getRecent(int $limit = 5): array
    {
        return BlogPost::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get popular blog posts (by view count)
     */
    public function getPopular(int $limit = 5): array
    {
        return BlogPost::where('is_published', true)
            ->orderBy('view_count', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Get all distinct categories
     */
    public function getCategories(): array
    {
        return BlogPost::where('is_published', true)
            ->distinct()
            ->pluck('category')
            ->toArray();
    }

    /**
     * Get related posts by category
     */
    public function getRelated(int $postId, string $category, int $limit = 3): array
    {
        return BlogPost::where('is_published', true)
            ->where('category', $category)
            ->where('id', '!=', $postId)
            ->orderBy('published_at', 'desc')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    /**
     * Increment view count for a post
     */
    public function incrementViewCount(int $postId): void
    {
        BlogPost::find($postId)?->increment('view_count');
    }

    /**
     * Get all published posts
     */
    public function all(): array
    {
        return BlogPost::where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get()
            ->toArray();
    }
}
