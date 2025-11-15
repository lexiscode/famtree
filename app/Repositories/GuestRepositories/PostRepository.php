<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\Post;

class PostRepository
{
    /**
     * Get all posts for a user with relationships
     */
    public function getUserPosts(int $userId, int $limit = 20, int $offset = 0)
    {
        return Post::where('user_id', $userId)
            ->with(['user', 'images', 'reactions', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get();
    }

    /**
     * Get posts count for a user
     */
    public function getUserPostsCount(int $userId)
    {
        return Post::where('user_id', $userId)->count();
    }

    /**
     * Get a single post by ID with relationships
     */
    public function find(int $postId)
    {
        return Post::with(['user', 'images', 'reactions', 'comments.user'])
            ->findOrFail($postId);
    }

    /**
     * Create a new post
     */
    public function create(array $data)
    {
        return Post::create($data);
    }

    /**
     * Update a post
     */
    public function update(int $postId, array $data)
    {
        $post = Post::findOrFail($postId);
        $post->update($data);
        return $post;
    }

    /**
     * Delete a post (soft delete)
     */
    public function delete(int $postId)
    {
        $post = Post::findOrFail($postId);
        $post->delete();
        return $post;
    }

    /**
     * Search posts by title or content
     */
    public function searchUserPosts(int $userId, string $query, int $limit = 20)
    {
        return Post::where('user_id', $userId)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            })
            ->with(['user', 'images', 'reactions', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Filter posts by type
     */
    public function filterByType(int $userId, string $type, int $limit = 20)
    {
        return Post::where('user_id', $userId)
            ->where('type', $type)
            ->with(['user', 'images', 'reactions', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Increment views count
     */
    public function incrementViews(int $postId)
    {
        Post::findOrFail($postId)->increment('views_count');
    }

    /**
     * Update comment count
     */
    public function updateCommentCount(int $postId)
    {
        $post = Post::findOrFail($postId);
        $post->update(['comments_count' => $post->comments()->count()]);
    }

    /**
     * Update reaction count
     */
    public function updateReactionCount(int $postId)
    {
        $post = Post::findOrFail($postId);
        $post->update(['reactions_count' => $post->reactions()->count()]);
    }
}
