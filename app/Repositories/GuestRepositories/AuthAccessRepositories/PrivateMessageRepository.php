<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\Conversation;
use App\Models\GuestModels\PrivateMessage;
use Illuminate\Support\Collection;

class PrivateMessageRepository
{
    /**
     * Find or create a conversation between two users
     * Always stores with lower user ID as user_one for consistency
     */
    public function findOrCreateConversation(int $userOneId, int $userTwoId): Conversation
    {
        // Ensure consistent ordering (lower ID first)
        [$firstId, $secondId] = $userOneId < $userTwoId
            ? [$userOneId, $userTwoId]
            : [$userTwoId, $userOneId];

        return Conversation::firstOrCreate([
            'user_one_id' => $firstId,
            'user_two_id' => $secondId,
        ]);
    }

    /**
     * Find a conversation by UUID
     */
    public function findConversationByUuid(string $uuid): ?Conversation
    {
        return Conversation::where('uuid', $uuid)->first();
    }

    /**
     * Find a conversation by ID
     */
    public function findConversationById(int $id): ?Conversation
    {
        return Conversation::find($id);
    }

    /**
     * Get all conversations for a user with latest message preview
     */
    public function getUserConversations(int $userId, int $limit = 50): Collection
    {
        return Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->with([
                'userOne:id,uuid,first_name,last_name,username,profile_image',
                'userTwo:id,uuid,first_name,last_name,username,profile_image',
                'latestMessage.sender:id,first_name,last_name',
            ])
            ->orderByDesc('last_message_at')
            ->limit($limit)
            ->get();
    }

    /**
     * Get messages for a conversation
     */
    public function getMessages(int $conversationId, int $limit = 50): Collection
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->with([
                'sender:id,first_name,last_name,profile_image',
                'repliedMessage:id,sender_id,message',
                'repliedMessage.sender:id,first_name,last_name',
            ])
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Get paginated messages for a conversation
     */
    public function getMessagesPaginated(int $conversationId, int $perPage = 50)
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->with('sender:id,first_name,last_name,profile_image')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Create a new message
     */
    public function createMessage(int $conversationId, int $senderId, string $message, ?int $replyToId = null): PrivateMessage
    {
        $privateMessage = PrivateMessage::create([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'message' => $message,
            'reply_to_id' => $replyToId,
        ]);

        // Update conversation's last_message_at timestamp
        Conversation::where('id', $conversationId)->update([
            'last_message_at' => now(),
        ]);

        return $privateMessage;
    }

    /**
     * Mark all messages in a conversation as delivered for a user
     * Only marks messages sent by others (not own messages)
     */
    public function markAsDelivered(int $conversationId, int $userId): int
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_delivered', false)
            ->update([
                'is_delivered' => true,
                'delivered_at' => now(),
            ]);
    }

    /**
     * Mark all undelivered messages across all conversations as delivered for a user
     * Returns array of conversation IDs that had messages marked as delivered
     */
    public function markAllAsDelivered(int $userId): array
    {
        $conversationIds = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->pluck('id');

        // Get conversations that have undelivered messages
        $affectedConversationIds = PrivateMessage::whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $userId)
            ->where('is_delivered', false)
            ->distinct()
            ->pluck('conversation_id')
            ->toArray();

        if (!empty($affectedConversationIds)) {
            PrivateMessage::whereIn('conversation_id', $conversationIds)
                ->where('sender_id', '!=', $userId)
                ->where('is_delivered', false)
                ->update([
                    'is_delivered' => true,
                    'delivered_at' => now(),
                ]);
        }

        return $affectedConversationIds;
    }

    /**
     * Mark all messages in a conversation as read for a user
     * Only marks messages sent by others (not own messages)
     */
    public function markAsRead(int $conversationId, int $userId): int
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->update([
                'is_delivered' => true,
                'delivered_at' => now(),
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Get total unread count for a user across all conversations
     */
    public function getTotalUnreadCount(int $userId): int
    {
        $conversationIds = Conversation::where('user_one_id', $userId)
            ->orWhere('user_two_id', $userId)
            ->pluck('id');

        return PrivateMessage::whereIn('conversation_id', $conversationIds)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Get unread count for a specific conversation
     */
    public function getUnreadCountForConversation(int $conversationId, int $userId): int
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }

    /**
     * Delete a message
     */
    public function deleteMessage(int $messageId): bool
    {
        return PrivateMessage::where('id', $messageId)->delete() > 0;
    }

    /**
     * Get the latest message in a conversation
     */
    public function getLatestMessage(int $conversationId): ?PrivateMessage
    {
        return PrivateMessage::where('conversation_id', $conversationId)
            ->with('sender:id,first_name,last_name,profile_image')
            ->latest()
            ->first();
    }

    /**
     * Check if a conversation exists between two users
     */
    public function conversationExists(int $userOneId, int $userTwoId): bool
    {
        [$firstId, $secondId] = $userOneId < $userTwoId
            ? [$userOneId, $userTwoId]
            : [$userTwoId, $userOneId];

        return Conversation::where('user_one_id', $firstId)
            ->where('user_two_id', $secondId)
            ->exists();
    }

    /**
     * Find a message by ID
     */
    public function findMessage(int $messageId): ?PrivateMessage
    {
        return PrivateMessage::find($messageId);
    }

    /**
     * Update a message's content
     */
    public function updateMessage(int $messageId, string $newMessage): ?PrivateMessage
    {
        $message = PrivateMessage::find($messageId);

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
     * Delete a message permanently
     */
    public function deleteMessagePermanently(int $messageId): bool
    {
        return PrivateMessage::where('id', $messageId)->delete() > 0;
    }

    /**
     * Bulk delete messages permanently
     */
    public function bulkDeleteMessages(array $messageIds): int
    {
        return PrivateMessage::whereIn('id', $messageIds)->delete();
    }
}
