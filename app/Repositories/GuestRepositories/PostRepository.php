<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\Post;

class PostRepository
{
    /**
     * Get all posts for a user with relationships
     * Filters posts based on privacy settings and viewer's relationship to post owner
     */
    public function getUserPosts(int $userId, int $viewerId, int $limit = 20, int $offset = 0)
    {
        $query = Post::where('user_id', $userId)
            ->with(['user', 'images', 'reactions', 'comments.user']);

        // If viewer is not the owner, filter by privacy settings
        if ($viewerId !== $userId) {
            $query->where(function ($q) use ($userId, $viewerId) {
                // Always show public posts
                $q->where('privacy', 'public')
                  // Show 'connected' posts only if viewer is connected to owner
                  ->orWhere(function ($subQ) use ($userId, $viewerId) {
                      $subQ->where('privacy', 'connected')
                           ->whereExists(function ($connQuery) use ($userId, $viewerId) {
                               $connQuery->select(\DB::raw(1))
                                   ->from('user_connections')
                                   ->where('status', 'accepted')
                                   ->where(function ($q) use ($userId, $viewerId) {
                                       $q->where(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $viewerId)
                                             ->where('recipient_user_id', $userId);
                                       })
                                       ->orWhere(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $userId)
                                             ->where('recipient_user_id', $viewerId);
                                       });
                                   });
                           });
                  });
                // Note: 'private' posts are never shown to others
            });
        }

        return $query->orderBy('created_at', 'desc')
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
     * Filters posts based on privacy settings and viewer's relationship to post owner
     */
    public function searchUserPosts(int $userId, int $viewerId, string $query, int $limit = 20)
    {
        $queryBuilder = Post::where('user_id', $userId)
            ->where(function ($q) use ($query) {
                $q->where('title', 'like', "%{$query}%")
                  ->orWhere('content', 'like', "%{$query}%");
            });

        // Apply privacy filtering if viewer is not the owner
        if ($viewerId !== $userId) {
            $queryBuilder->where(function ($q) use ($userId, $viewerId) {
                $q->where('privacy', 'public')
                  ->orWhere(function ($subQ) use ($userId, $viewerId) {
                      $subQ->where('privacy', 'connected')
                           ->whereExists(function ($connQuery) use ($userId, $viewerId) {
                               $connQuery->select(\DB::raw(1))
                                   ->from('user_connections')
                                   ->where('status', 'accepted')
                                   ->where(function ($q) use ($userId, $viewerId) {
                                       $q->where(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $viewerId)
                                             ->where('recipient_user_id', $userId);
                                       })
                                       ->orWhere(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $userId)
                                             ->where('recipient_user_id', $viewerId);
                                       });
                                   });
                           });
                  });
            });
        }

        return $queryBuilder->with(['user', 'images', 'reactions', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Filter posts by type
     * Filters posts based on privacy settings and viewer's relationship to post owner
     */
    public function filterByType(int $userId, int $viewerId, string $type, int $limit = 20)
    {
        $query = Post::where('user_id', $userId)
            ->where('type', $type);

        // Apply privacy filtering if viewer is not the owner
        if ($viewerId !== $userId) {
            $query->where(function ($q) use ($userId, $viewerId) {
                $q->where('privacy', 'public')
                  ->orWhere(function ($subQ) use ($userId, $viewerId) {
                      $subQ->where('privacy', 'connected')
                           ->whereExists(function ($connQuery) use ($userId, $viewerId) {
                               $connQuery->select(\DB::raw(1))
                                   ->from('user_connections')
                                   ->where('status', 'accepted')
                                   ->where(function ($q) use ($userId, $viewerId) {
                                       $q->where(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $viewerId)
                                             ->where('recipient_user_id', $userId);
                                       })
                                       ->orWhere(function ($q) use ($userId, $viewerId) {
                                           $q->where('requester_user_id', $userId)
                                             ->where('recipient_user_id', $viewerId);
                                       });
                                   });
                           });
                  });
            });
        }

        return $query->with(['user', 'images', 'reactions', 'comments.user'])
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
