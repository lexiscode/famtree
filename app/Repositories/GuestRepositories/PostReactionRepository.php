<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\PostReaction;

class PostReactionRepository
{
    /**
     * Get all reactions for a post
     */
    public function getPostReactions(int $postId)
    {
        return PostReaction::where('post_id', $postId)
            ->with('user')
            ->get();
    }

    /**
     * Get reaction count by type
     */
    public function getReactionCountByType(int $postId, string $type)
    {
        return PostReaction::where('post_id', $postId)
            ->where('reaction_type', $type)
            ->count();
    }

    /**
     * Add or update a reaction
     */
    public function createOrUpdate(int $postId, int $userId, string $reactionType)
    {
        return PostReaction::updateOrCreate(
            ['post_id' => $postId, 'user_id' => $userId],
            ['reaction_type' => $reactionType]
        );
    }

    /**
     * Get user's reaction on a post
     */
    public function getUserReaction(int $postId, int $userId)
    {
        return PostReaction::where('post_id', $postId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Remove a reaction
     */
    public function delete(int $postId, int $userId)
    {
        PostReaction::where('post_id', $postId)
            ->where('user_id', $userId)
            ->delete();
    }

    /**
     * Get all users who reacted with a specific type
     */
    public function getUsersWithReactionType(int $postId, string $reactionType)
    {
        return PostReaction::where('post_id', $postId)
            ->where('reaction_type', $reactionType)
            ->with('user')
            ->get();
    }
}
