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
                'userOne:id,uuid,first_name,last_name,profile_image_url',
                'userTwo:id,uuid,first_name,last_name,profile_image_url',
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
            ->with('sender:id,first_name,last_name,profile_image_url')
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
            ->with('sender:id,first_name,last_name,profile_image_url')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * Create a new message
     */
    public function createMessage(int $conversationId, int $senderId, string $message): PrivateMessage
    {
        $privateMessage = PrivateMessage::create([
            'conversation_id' => $conversationId,
            'sender_id' => $senderId,
            'message' => $message,
        ]);

        // Update conversation's last_message_at timestamp
        Conversation::where('id', $conversationId)->update([
            'last_message_at' => now(),
        ]);

        return $privateMessage;
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
            ->with('sender:id,first_name,last_name,profile_image_url')
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
}
