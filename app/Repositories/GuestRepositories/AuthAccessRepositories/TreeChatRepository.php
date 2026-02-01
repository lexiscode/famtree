<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\TreeChatMessage;
use App\Models\GuestModels\TreeChatRead;
use Illuminate\Database\Eloquent\Collection;

class TreeChatRepository
{
    /**
     * Get chat messages for a family tree (paginated)
     */
    public function getMessages(int $treeId, int $limit = 50)
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->with('user:id,first_name,last_name,profile_image')
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
            ->with('user:id,first_name,last_name,profile_image')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Create a new chat message
     */
    public function createMessage(int $treeId, int $userId, string $message): TreeChatMessage
    {
        $chatMessage = TreeChatMessage::create([
            'family_tree_id' => $treeId,
            'user_id' => $userId,
            'message' => $message,
        ]);

        // Update the sender's last_read_at to include their own message
        // This ensures they don't see their own message as unread
        $this->markAsRead($treeId, $userId);

        return $chatMessage;
    }

    /**
     * Mark messages as read for a user by updating their last_read_at timestamp
     */
    public function markAsRead(int $treeId, int $userId): void
    {
        TreeChatRead::updateOrCreate(
            [
                'family_tree_id' => $treeId,
                'user_id' => $userId,
            ],
            [
                'last_read_at' => now(),
            ]
        );
    }

    /**
     * Get unread message count for a user in a tree
     * Counts messages from OTHER users created after the user's last_read_at
     */
    public function getUnreadCount(int $treeId, int $userId): int
    {
        // Get the user's last read timestamp for this tree
        $lastRead = TreeChatRead::where('family_tree_id', $treeId)
            ->where('user_id', $userId)
            ->value('last_read_at');

        $query = TreeChatMessage::where('family_tree_id', $treeId)
            ->where('user_id', '!=', $userId); // Only count messages from OTHER users

        if ($lastRead) {
            $query->where('created_at', '>', $lastRead);
        }

        return $query->count();
    }

    /**
     * Find a message by ID
     */
    public function findMessage(int $messageId): ?TreeChatMessage
    {
        return TreeChatMessage::find($messageId);
    }

    /**
     * Update a message's content
     */
    public function updateMessage(int $messageId, string $newMessage): ?TreeChatMessage
    {
        $message = TreeChatMessage::find($messageId);

        if ($message) {
            $message->update([
                'message' => $newMessage,
                'is_edited' => true,
                'edited_at' => now(),
            ]);
        }

        return $message;
    }

    /**
     * Delete a message
     */
    public function deleteMessage(int $messageId): bool
    {
        return TreeChatMessage::destroy($messageId) > 0;
    }

    /**
     * Bulk delete messages
     */
    public function bulkDeleteMessages(array $messageIds): int
    {
        return TreeChatMessage::whereIn('id', $messageIds)->delete();
    }

    /**
     * Get latest message for a tree
     */
    public function getLatestMessage(int $treeId): ?TreeChatMessage
    {
        return TreeChatMessage::where('family_tree_id', $treeId)
            ->with('user:id,first_name,last_name,profile_image')
            ->latest()
            ->first();
    }

    /**
     * Get total unread message count for a user across all their trees
     * Counts messages from OTHER users created after each tree's last_read_at
     */
    public function getTotalUnreadCount(int $userId, array $treeIds): int
    {
        if (empty($treeIds)) {
            return 0;
        }

        $totalUnread = 0;

        foreach ($treeIds as $treeId) {
            $totalUnread += $this->getUnreadCount($treeId, $userId);
        }

        return $totalUnread;
    }
}
