<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\PostComment;

class PostCommentRepository
{
    /**
     * Get all comments for a post
     */
    public function getPostComments(int $postId, int $limit = 50)
    {
        return PostComment::where('post_id', $postId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Create a new comment
     */
    public function create(array $data)
    {
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
     * Count comments for a post
     */
    public function countPostComments(int $postId)
    {
        return PostComment::where('post_id', $postId)->count();
    }
}
