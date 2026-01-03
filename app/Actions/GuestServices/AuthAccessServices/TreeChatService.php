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
     * Mark messages as read
     */
    public function markAsRead(int $treeId, int $userId): int
    {
        return $this->chatRepository->markAsRead($treeId, $userId);
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
}
