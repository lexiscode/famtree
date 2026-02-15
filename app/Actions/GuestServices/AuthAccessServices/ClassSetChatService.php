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

        // Check if user is muted (pending removal)
        $membership = $this->classSetRepository->getMembership($classSet->id, $userId);
        if ($membership && $membership->is_muted) {
            throw ValidationException::withMessages([
                'message' => ['You cannot send messages while a removal is pending.'],
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
                $isBroadcast = (bool) $msg->is_org_broadcast;

                if ($isBroadcast) {
                    $org = $msg->organization;
                    $senderData = [
                        'id' => $org?->id ?? 0,
                        'uuid' => null,
                        'first_name' => $org?->short_name ?: ($org?->name ?? 'Organization'),
                        'last_name' => '',
                        'username' => $org?->slug ?? '',
                        'profile_image' => $org?->logo_url,
                    ];
                } elseif ($msg->sender) {
                    $senderData = [
                        'id' => $msg->sender->id,
                        'uuid' => $msg->sender->uuid,
                        'first_name' => $msg->sender->first_name,
                        'last_name' => $msg->sender->last_name,
                        'username' => $msg->sender->username,
                        'profile_image' => $msg->sender->profile_image_url,
                    ];
                } else {
                    // System message (no sender)
                    $senderData = null;
                }

                $data = [
                    'id' => $msg->id,
                    'uuid' => $msg->uuid,
                    'message' => $msg->message,
                    'is_org_broadcast' => $isBroadcast,
                    'sender' => $senderData,
                    'created_at' => $msg->created_at,
                ];

                if ($isBroadcast && $org) {
                    $data['organization'] = [
                        'id' => $org->id,
                        'name' => $org->name,
                        'short_name' => $org->short_name,
                        'logo_url' => $org->logo_url,
                    ];
                }

                return $data;
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
        $updatedMessage->load('sender:id,uuid,first_name,last_name,username,profile_image');

        return [
            'success' => true,
            'message' => [
                'id' => $updatedMessage->id,
                'uuid' => $updatedMessage->uuid,
                'message' => $updatedMessage->message,
                'is_edited' => $updatedMessage->is_edited,
                'edited_at' => $updatedMessage->edited_at?->toISOString(),
                'sender' => [
                    'id' => $updatedMessage->sender->id,
                    'uuid' => $updatedMessage->sender->uuid,
                    'first_name' => $updatedMessage->sender->first_name,
                    'last_name' => $updatedMessage->sender->last_name,
                    'username' => $updatedMessage->sender->username,
                    'profile_image' => $updatedMessage->sender->profile_image_url,
                ],
                'created_at' => $updatedMessage->created_at,
            ],
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

        $deleted = $this->messageRepository->delete($messageId);

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
                continue;
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
