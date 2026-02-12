<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Events\PrivateMessageSent;
use App\Events\PrivateUserTyping;
use App\Events\MessageDelivered;
use App\Events\MessageRead;
use App\Models\GuestModels\Conversation;
use App\Models\GuestModels\PrivateMessage;
use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\AuthAccessRepositories\PrivateMessageRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\UserFollowRepository;
use Illuminate\Support\Collection;

class PrivateMessageService
{
    public function __construct(
        private PrivateMessageRepository $messageRepository,
        private UserConnectionRepository $connectionRepository,
        private UserFollowRepository $followRepository
    ) {}

    /**
     * Check if a user can message another user
     * Users can message: connections OR their followers
     */
    public function canMessage(int $senderId, int $recipientId): bool
    {
        // Can't message yourself
        if ($senderId === $recipientId) {
            return false;
        }

        // Check if they have an accepted connection
        $connection = $this->connectionRepository->getConnectionBetween($senderId, $recipientId);
        if ($connection) {
            return true;
        }

        // Check if recipient follows the sender (followers can be messaged)
        if ($this->followRepository->isFollowing($recipientId, $senderId)) {
            return true;
        }

        return false;
    }

    /**
     * Get or create a conversation between two users
     */
    public function getOrCreateConversation(int $userId, int $otherUserId): array
    {
        if (!$this->canMessage($userId, $otherUserId)) {
            return [
                'success' => false,
                'error' => 'You cannot message this user. You must be connected or they must follow you.',
            ];
        }

        $conversation = $this->messageRepository->findOrCreateConversation($userId, $otherUserId);

        return [
            'success' => true,
            'conversation' => $conversation,
        ];
    }

    /**
     * Send a message in a conversation
     */
    public function sendMessage(int $conversationId, int $senderId, string $message): array
    {
        $trimmedMessage = trim($message);

        if (empty($trimmedMessage)) {
            return [
                'success' => false,
                'error' => 'Message cannot be empty',
            ];
        }

        if (strlen($trimmedMessage) > 5000) {
            return [
                'success' => false,
                'error' => 'Message cannot exceed 5000 characters',
            ];
        }

        $conversation = $this->messageRepository->findConversationById($conversationId);

        if (!$conversation) {
            return [
                'success' => false,
                'error' => 'Conversation not found',
            ];
        }

        // Verify sender is part of conversation
        if (!$conversation->hasParticipant($senderId)) {
            return [
                'success' => false,
                'error' => 'Unauthorized',
            ];
        }

        $privateMessage = $this->messageRepository->createMessage(
            $conversation->id,
            $senderId,
            $trimmedMessage
        );

        // Load sender info for broadcast
        $privateMessage->load('sender:id,first_name,last_name,profile_image_url');

        // Broadcast to both users
        broadcast(new PrivateMessageSent($privateMessage, $conversation))->toOthers();

        return [
            'success' => true,
            'message' => $privateMessage,
        ];
    }

    /**
     * Get all conversations for a user
     */
    public function getConversations(int $userId, int $limit = 50): Collection
    {
        return $this->messageRepository->getUserConversations($userId, $limit);
    }

    /**
     * Get messages for a conversation
     * Also marks messages as delivered when recipient fetches them
     */
    public function getMessages(int $conversationId, int $userId, int $limit = 50): Collection
    {
        // Mark messages from others as delivered when fetched
        $deliveredCount = $this->messageRepository->markAsDelivered($conversationId, $userId);

        if ($deliveredCount > 0) {
            $conversation = $this->messageRepository->findConversationById($conversationId);
            if ($conversation) {
                broadcast(new MessageDelivered($conversation, $userId))->toOthers();
            }
        }

        return $this->messageRepository->getMessages($conversationId, $limit);
    }

    /**
     * Mark messages in a conversation as read
     */
    public function markAsRead(int $conversationId, int $userId): int
    {
        $count = $this->messageRepository->markAsRead($conversationId, $userId);

        if ($count > 0) {
            $conversation = $this->messageRepository->findConversationById($conversationId);
            if ($conversation) {
                broadcast(new MessageRead($conversation, $userId))->toOthers();
            }
        }

        return $count;
    }

    /**
     * Mark all undelivered messages across all conversations as delivered
     * Called when user comes online / loads messages page
     */
    public function markAllAsDelivered(int $userId): void
    {
        $affectedConversationIds = $this->messageRepository->markAllAsDelivered($userId);

        // Broadcast delivery status to each conversation's sender
        foreach ($affectedConversationIds as $conversationId) {
            $conversation = $this->messageRepository->findConversationById($conversationId);
            if ($conversation) {
                broadcast(new MessageDelivered($conversation, $userId))->toOthers();
            }
        }
    }

    /**
     * Mark messages in a specific conversation as delivered
     * Called when user receives message via broadcast
     */
    public function markConversationAsDelivered(int $conversationId, int $userId): void
    {
        $count = $this->messageRepository->markAsDelivered($conversationId, $userId);

        if ($count > 0) {
            $conversation = $this->messageRepository->findConversationById($conversationId);
            if ($conversation) {
                broadcast(new MessageDelivered($conversation, $userId))->toOthers();
            }
        }
    }

    /**
     * Broadcast typing indicator
     */
    public function broadcastTyping(string $conversationUuid, User $user, bool $isTyping): void
    {
        broadcast(new PrivateUserTyping($conversationUuid, $user, $isTyping))->toOthers();
    }

    /**
     * Get total unread message count for a user
     */
    public function getTotalUnreadCount(int $userId): int
    {
        return $this->messageRepository->getTotalUnreadCount($userId);
    }

    /**
     * Get unread count for a specific conversation
     */
    public function getUnreadCountForConversation(int $conversationId, int $userId): int
    {
        return $this->messageRepository->getUnreadCountForConversation($conversationId, $userId);
    }

    /**
     * Get conversation by UUID
     */
    public function getConversationByUuid(string $uuid): ?Conversation
    {
        return $this->messageRepository->findConversationByUuid($uuid);
    }

    /**
     * Edit a message
     */
    public function editMessage(int $messageId, int $userId, string $newMessage): array
    {
        $message = $this->messageRepository->findMessage($messageId);

        if (!$message) {
            return [
                'success' => false,
                'error' => 'Message not found',
            ];
        }

        // Only the sender can edit their message
        if ($message->sender_id !== $userId) {
            return [
                'success' => false,
                'error' => 'You can only edit your own messages',
            ];
        }

        $trimmedMessage = trim($newMessage);

        if (empty($trimmedMessage)) {
            return [
                'success' => false,
                'error' => 'Message cannot be empty',
            ];
        }

        if (strlen($trimmedMessage) > 5000) {
            return [
                'success' => false,
                'error' => 'Message cannot exceed 5000 characters',
            ];
        }

        $updatedMessage = $this->messageRepository->updateMessage($messageId, $trimmedMessage);
        $updatedMessage->load('sender:id,first_name,last_name,profile_image');

        return [
            'success' => true,
            'message' => $updatedMessage,
        ];
    }

    /**
     * Delete a message
     */
    public function deleteMessage(int $messageId, int $userId): array
    {
        $message = $this->messageRepository->findMessage($messageId);

        if (!$message) {
            return [
                'success' => false,
                'error' => 'Message not found',
            ];
        }

        // Only the sender can delete their message
        if ($message->sender_id !== $userId) {
            return [
                'success' => false,
                'error' => 'You can only delete your own messages',
            ];
        }

        $deleted = $this->messageRepository->deleteMessagePermanently($messageId);

        return [
            'success' => $deleted,
            'error' => $deleted ? null : 'Failed to delete message',
        ];
    }

    /**
     * Bulk delete messages
     */
    public function bulkDeleteMessages(array $messageIds, int $userId): array
    {
        if (empty($messageIds)) {
            return [
                'success' => false,
                'error' => 'No messages selected',
            ];
        }

        // Verify all messages belong to the user
        foreach ($messageIds as $messageId) {
            $message = $this->messageRepository->findMessage($messageId);

            if (!$message) {
                continue; // Skip if message doesn't exist
            }

            if ($message->sender_id !== $userId) {
                return [
                    'success' => false,
                    'error' => 'You can only delete your own messages',
                ];
            }
        }

        $deletedCount = $this->messageRepository->bulkDeleteMessages($messageIds);

        return [
            'success' => true,
            'deleted_count' => $deletedCount,
        ];
    }
}
