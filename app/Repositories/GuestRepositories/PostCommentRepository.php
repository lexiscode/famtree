<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\PostComment;
use App\Models\GuestModels\PostCommentLike;

class PostCommentRepository
{
    /**
     * Get threaded comments for a post (top-level newest-first, replies oldest-first)
     */
    public function getPostComments(int $postId, int $limit = 50)
    {
        return PostComment::where('post_id', $postId)
            ->whereNull('parent_comment_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Create a new comment
     */
    public function create(array $data)
    {
        // Flatten: if parent is itself a reply, use its parent instead (max 2 levels)
        if (!empty($data['parent_comment_id'])) {
            $parent = PostComment::find($data['parent_comment_id']);
            if ($parent && $parent->parent_comment_id) {
                $data['parent_comment_id'] = $parent->parent_comment_id;
            }
        }

        return PostComment::create($data);
    }

    /**
     * Update a comment
     */
    public function update(int $commentId, array $data)
    {
        $comment = PostComment::findOrFail($commentId);
        $comment->update($data);
        return $comment;
    }

    /**
     * Delete a comment
     */
    public function delete(int $commentId)
    {
        $comment = PostComment::findOrFail($commentId);
        $comment->delete();
        return $comment;
    }

    /**
     * Find a comment by ID
     */
    public function find(int $commentId)
    {
        return PostComment::with('user')->findOrFail($commentId);
    }

    /**
     * Find a comment by UUID with full context
     */
    public function findByUuid(string $uuid)
    {
        return PostComment::where('uuid', $uuid)
            ->with(['user', 'post.user', 'post.images', 'replies.user', 'replies.likes', 'parent.user'])
            ->first();
    }

    /**
     * Count comments for a post
     */
    public function countPostComments(int $postId)
    {
        return PostComment::where('post_id', $postId)->count();
    }

    /**
     * Toggle a like on a comment
     */
    public function toggleLike(int $commentId, int $userId): array
    {
        $existing = PostCommentLike::where('comment_id', $commentId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->delete();
            PostComment::where('id', $commentId)->decrement('likes_count');
            $comment = PostComment::find($commentId);
            return ['liked' => false, 'likes_count' => $comment->likes_count];
        }

        PostCommentLike::create([
            'comment_id' => $commentId,
            'user_id' => $userId,
        ]);
        PostComment::where('id', $commentId)->increment('likes_count');
        $comment = PostComment::find($commentId);
        return ['liked' => true, 'likes_count' => $comment->likes_count];
    }

    /**
     * Check if user has liked a comment
     */
    public function userHasLiked(int $commentId, int $userId): bool
    {
        return PostCommentLike::where('comment_id', $commentId)
            ->where('user_id', $userId)
            ->exists();
    }
}
