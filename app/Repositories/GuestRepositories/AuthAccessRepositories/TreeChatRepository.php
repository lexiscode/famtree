<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\TreeChatMessage;
use Illuminate\Database\Eloquent\Collection;

class TreeChatRepository
{
    /**
     * Get chat messages for a family tree (paginated)
     */
    public function getMessages(int $treeId, int $limit = 50)
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->with('user:id,first_name,last_name,profile_image_url')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Get paginated messages for a family tree
     */
    public function getMessagesPaginated(int $treeId, int $perPage = 50)
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->with('user:id,first_name,last_name,profile_image_url')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a new chat message
     */
    public function createMessage(int $treeId, int $userId, string $message): TreeChatMessage
    {
        return TreeChatMessage::create([
            'family_tree_id' => $treeId,
            'user_id' => $userId,
            'message' => $message,
        ]);
    }

    /**
     * Mark messages as read for a user
     */
    public function markAsRead(int $treeId, int $userId): int
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->update(['is_read' => true]);
    }

    /**
     * Get unread message count for a user in a tree
     */
    public function getUnreadCount(int $treeId, int $userId): int
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Delete a message
     */
    public function deleteMessage(int $messageId): bool
    {
        return TreeChatMessage::destroy($messageId) > 0;
    }

    /**
     * Get latest message for a tree
     */
    public function getLatestMessage(int $treeId): ?TreeChatMessage
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->with('user:id,first_name,last_name')
            ->latest()
            ->first();
    }
}
