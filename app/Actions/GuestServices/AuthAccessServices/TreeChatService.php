<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Events\TreeMessageSent;
use App\Events\TreeUserTyping;
use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\AuthAccessRepositories\TreeChatRepository;
use Illuminate\Support\Collection;

class TreeChatService
{
    public function __construct(
        private TreeChatRepository $chatRepository
    ) {}

    /**
     * Send a chat message and broadcast it
     */
    public function sendMessage(int $treeId, int $userId, string $message): array
    {
        // Validate message is not empty
        $trimmedMessage = trim($message);
        if (empty($trimmedMessage)) {
            return [
                'success' => false,
                'error' => 'Message cannot be empty',
            ];
        }

        // Create the message
        $chatMessage = $this->chatRepository->createMessage($treeId, $userId, $trimmedMessage);

        // Load the user relationship
        $chatMessage->load('user:id,first_name,last_name,profile_image_url');

        // Broadcast the message event
        broadcast(new TreeMessageSent($chatMessage))->toOthers();

        return [
            'success' => true,
            'message' => $chatMessage,
        ];
    }

    /**
     * Get chat messages for a tree
     */
    public function getMessages(int $treeId, int $limit = 50): Collection
    {
        return $this->chatRepository->getMessages($treeId, $limit);
    }

    /**
     * Broadcast typing indicator
     */
    public function broadcastTyping(int $treeId, User $user, bool $isTyping): void
    {
        broadcast(new TreeUserTyping($treeId, $user, $isTyping))->toOthers();
    }

    /**
     * Mark messages as read for a user
     */
    public function markAsRead(int $treeId, int $userId): void
    {
        $this->chatRepository->markAsRead($treeId, $userId);
    }

    /**
     * Get unread message count
     */
    public function getUnreadCount(int $treeId, int $userId): int
    {
        return $this->chatRepository->getUnreadCount($treeId, $userId);
    }

    /**
     * Get latest message for a tree
     */
    public function getLatestMessage(int $treeId)
    {
        return $this->chatRepository->getLatestMessage($treeId);
    }

    /**
     * Edit a message
     */
    public function editMessage(int $messageId, int $userId, string $newMessage): array
    {
        $message = $this->chatRepository->findMessage($messageId);

        if (!$message) {
            return [
                'success' => false,
                'error' => 'Message not found',
            ];
        }

        // Only the sender can edit their message
        if ($message->user_id !== $userId) {
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

        $updatedMessage = $this->chatRepository->updateMessage($messageId, $trimmedMessage);
        $updatedMessage->load('user:id,first_name,last_name,profile_image');

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
        $message = $this->chatRepository->findMessage($messageId);

        if (!$message) {
            return [
                'success' => false,
                'error' => 'Message not found',
            ];
        }

        // Only the sender can delete their message
        if ($message->user_id !== $userId) {
            return [
                'success' => false,
                'error' => 'You can only delete your own messages',
            ];
        }

        $deleted = $this->chatRepository->deleteMessage($messageId);

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
            $message = $this->chatRepository->findMessage($messageId);

            if (!$message) {
                continue;
            }

            if ($message->user_id !== $userId) {
                return [
                    'success' => false,
                    'error' => 'You can only delete your own messages',
                ];
            }
        }

        $deletedCount = $this->chatRepository->bulkDeleteMessages($messageIds);

        return [
            'success' => true,
            'deleted_count' => $deletedCount,
        ];
    }
}
