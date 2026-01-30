<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Events\ClassSetMessageSent;
use App\Events\ClassSetUserTyping;
use Illuminate\Validation\ValidationException;

class ClassSetChatService
{
    public function __construct(
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $messageRepository
    ) {
    }

    /**
     * Send a message to a class set chat
     */
    public function sendMessage(string $classSetUuid, int $userId, string $message): array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            throw ValidationException::withMessages([
                'class_set' => ['Class set not found.'],
            ]);
        }

        if (!$this->classSetRepository->isMember($classSet->id, $userId)) {
            throw ValidationException::withMessages([
                'class_set' => ['You must be a member to send messages.'],
            ]);
        }

        $message = trim($message);
        if (empty($message)) {
            throw ValidationException::withMessages([
                'message' => ['Message cannot be empty.'],
            ]);
        }

        if (strlen($message) > 5000) {
            throw ValidationException::withMessages([
                'message' => ['Message is too long. Maximum 5000 characters allowed.'],
            ]);
        }

        $chatMessage = $this->messageRepository->createMessage($classSet->id, $userId, $message);

        // Mark as read for the sender (they shouldn't see their own message as unread)
        $this->messageRepository->markAsRead($classSet->id, $userId);

        // Load the sender relationship
        $chatMessage->load('sender:id,uuid,first_name,last_name,username,profile_image');

        // Broadcast the message
        broadcast(new ClassSetMessageSent($chatMessage, $classSet))->toOthers();

        return [
            'success' => true,
            'message' => [
                'id' => $chatMessage->id,
                'uuid' => $chatMessage->uuid,
                'message' => $chatMessage->message,
                'sender' => [
                    'id' => $chatMessage->sender->id,
                    'uuid' => $chatMessage->sender->uuid,
                    'first_name' => $chatMessage->sender->first_name,
                    'last_name' => $chatMessage->sender->last_name,
                    'username' => $chatMessage->sender->username,
                    'profile_image' => $chatMessage->sender->profile_image_url,
                ],
                'created_at' => $chatMessage->created_at,
            ],
        ];
    }

    /**
     * Get messages for a class set chat
     */
    public function getMessages(string $classSetUuid, int $userId, ?int $beforeId = null, int $limit = 50): array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            throw ValidationException::withMessages([
                'class_set' => ['Class set not found.'],
            ]);
        }

        if (!$this->classSetRepository->isMember($classSet->id, $userId)) {
            throw ValidationException::withMessages([
                'class_set' => ['You must be a member to view messages.'],
            ]);
        }

        $messages = $this->messageRepository->getMessages($classSet->id, $limit, $beforeId);

        // Mark messages as read when user opens the chat
        $this->messageRepository->markAsRead($classSet->id, $userId);

        return [
            'class_set' => [
                'id' => $classSet->id,
                'uuid' => $classSet->uuid,
                'name' => $classSet->name,
            ],
            'messages' => $messages->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'uuid' => $msg->uuid,
                    'message' => $msg->message,
                    'sender' => [
                        'id' => $msg->sender->id,
                        'uuid' => $msg->sender->uuid,
                        'first_name' => $msg->sender->first_name,
                        'last_name' => $msg->sender->last_name,
                        'username' => $msg->sender->username,
                        'profile_image' => $msg->sender->profile_image_url,
                    ],
                    'created_at' => $msg->created_at,
                ];
            }),
            'has_more' => $messages->count() >= $limit,
        ];
    }

    /**
     * Broadcast typing indicator
     */
    public function broadcastTyping(string $classSetUuid, $user): void
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet || !$this->classSetRepository->isMember($classSet->id, $user->id)) {
            return;
        }

        broadcast(new ClassSetUserTyping($classSet, $user))->toOthers();
    }
}
