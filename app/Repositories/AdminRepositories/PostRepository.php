<?php
namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\Post;
use App\Models\OrgModels\OrgPost;
use App\Models\GuestModels\Gallery;
use App\Models\GuestModels\PostComment;
use Illuminate\Pagination\LengthAwarePaginator;

class PostRepository
{
    public function getAllPostsPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return Post::with(['user:id,first_name,last_name,username,profile_image', 'images'])
            ->withCount(['comments', 'reactions', 'refams'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function searchPosts(string $query, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return Post::with(['user:id,first_name,last_name,username,profile_image', 'images'])
            ->withCount(['comments', 'reactions', 'refams'])
            ->where(function ($q) use ($query) {
                $q->where('content', 'like', "%{$query}%")
                    ->orWhereHas('user', function ($uq) use ($query) {
                        $uq->where('first_name', 'like', "%{$query}%")
                            ->orWhere('last_name', 'like', "%{$query}%")
                            ->orWhere('username', 'like', "%{$query}%");
                    });
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function filterPosts(array $filters, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = Post::with(['user:id,first_name,last_name,username,profile_image', 'images'])
            ->withCount(['comments', 'reactions', 'refams']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('content', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('username', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (!empty($filters['privacy'])) {
            $query->where('privacy', $filters['privacy']);
        }

        $query->orderBy($filters['sortBy'] ?? 'created_at', $filters['sortOrder'] ?? 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function findPost(int $id): ?Post
    {
        return Post::with(['user:id,first_name,last_name,username,email,profile_image', 'images', 'comments.user:id,first_name,last_name,username', 'reactions'])
            ->withCount(['comments', 'reactions', 'refams'])
            ->find($id);
    }

    public function deletePost(int $id): bool
    {
        $post = Post::find($id);
        return $post ? $post->delete() : false;
    }

    public function findComment(int $id): ?PostComment
    {
        return PostComment::with('user:id,first_name,last_name,username')->find($id);
    }

    public function deleteComment(int $id): bool
    {
        $comment = PostComment::find($id);
        return $comment ? $comment->delete() : false;
    }

    public function countPosts(): int { return Post::count(); }
    public function countPostsWithTrashed(): int { return Post::withTrashed()->count(); }

    // Gallery methods
    public function getAllGalleriesPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return Gallery::with('user:id,first_name,last_name,username')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findGallery(int $id): ?Gallery
    {
        return Gallery::with('user:id,first_name,last_name,username')->find($id);
    }

    public function deleteGallery(int $id): bool
    {
        $gallery = Gallery::find($id);
        return $gallery ? $gallery->delete() : false;
    }

    // Org posts
    public function getAllOrgPostsPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return OrgPost::with(['organization:id,name,slug', 'creator:id,username,display_name', 'images'])
            ->withCount(['comments', 'reactions'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }
}
