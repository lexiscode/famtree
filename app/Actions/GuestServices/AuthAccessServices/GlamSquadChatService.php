<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\GlamSquadMessageRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\GlamRepository;
use App\Events\GlamSquadMessageSent;
use App\Events\GlamSquadUserTyping;
use Illuminate\Validation\ValidationException;

class GlamSquadChatService
{
    public function __construct(
        private GlamSquadMessageRepository $messageRepository,
        private GlamRepository $glamRepository,
    ) {}

    /**
     * Get messages for a squad chat.
     */
    public function getMessages(string $squadUuid, int $userId, ?int $beforeId = null): array
    {
        $squad = $this->glamRepository->findSquadByUuid($squadUuid);
        if (!$squad) {
            throw ValidationException::withMessages(['squad' => 'Squad not found']);
        }

        if (!$squad->isMember($userId)) {
            throw ValidationException::withMessages(['squad' => 'You are not a member of this squad']);
        }

        $messages = $this->messageRepository->getMessages($squad->id, $beforeId);
        $this->messageRepository->markAsRead($squad->id, $userId);

        return [
            'messages' => $messages->map(fn($m) => $this->formatMessage($m)),
            'has_more' => $messages->count() >= 50,
        ];
    }

    /**
     * Send a message.
     */
    public function sendMessage(string $squadUuid, int $userId, string $messageText, ?int $replyToId = null): array
    {
        $squad = $this->glamRepository->findSquadByUuid($squadUuid);
        if (!$squad) {
            throw ValidationException::withMessages(['squad' => 'Squad not found']);
        }

        if (!$squad->isMember($userId)) {
            throw ValidationException::withMessages(['squad' => 'You are not a member of this squad']);
        }

        $member = \App\Models\GuestModels\GlamSquadMember::where('squad_id', $squad->id)
            ->where('user_id', $userId)
            ->first();

        if ($member && $member->is_muted) {
            throw ValidationException::withMessages(['squad' => 'You are muted in this squad']);
        }

        $message = $this->messageRepository->createMessage([
            'squad_id' => $squad->id,
            'sender_id' => $userId,
            'message' => $messageText,
            'reply_to_id' => $replyToId,
        ]);

        $message->loadMissing(['sender', 'repliedMessage:id,sender_id,message', 'repliedMessage.sender:id,first_name,last_name']);

        broadcast(new GlamSquadMessageSent($message, $squad))->toOthers();

        return ['message' => $this->formatMessage($message)];
    }

    /**
     * Broadcast typing indicator.
     */
    public function broadcastTyping(string $squadUuid, $user): void
    {
        $squad = $this->glamRepository->findSquadByUuid($squadUuid);
        if (!$squad) return;

        broadcast(new GlamSquadUserTyping($squad, $user))->toOthers();
    }

    /**
     * Edit a message.
     */
    public function editMessage(int $messageId, int $userId, string $newMessage): array
    {
        $message = $this->messageRepository->findMessage($messageId);
        if (!$message || $message->sender_id !== $userId) {
            return ['success' => false, 'error' => 'You can only edit your own messages'];
        }

        $updated = $this->messageRepository->updateMessage($messageId, $newMessage);
        $updated->loadMissing('sender');

        return ['success' => true, 'message' => $this->formatMessage($updated)];
    }

    /**
     * Delete a message.
     */
    public function deleteMessage(int $messageId, int $userId): array
    {
        $message = $this->messageRepository->findMessage($messageId);
        if (!$message || $message->sender_id !== $userId) {
            return ['success' => false, 'error' => 'You can only delete your own messages'];
        }

        $this->messageRepository->delete($messageId);

        return ['success' => true];
    }

    /**
     * Bulk delete messages.
     */
    public function bulkDeleteMessages(array $messageIds, int $userId): array
    {
        $deleted = $this->messageRepository->bulkDeleteMessages($messageIds, $userId);

        return ['success' => true, 'deleted_count' => $deleted];
    }

    // ── Private Helpers ──

    private function formatMessage($message): array
    {
        return [
            'id' => $message->id,
            'uuid' => $message->uuid,
            'squad_id' => $message->squad_id,
            'sender_id' => $message->sender_id,
            'message' => $message->message,
            'reply_to_id' => $message->reply_to_id,
            'replied_message' => $message->repliedMessage ? [
                'id' => $message->repliedMessage->id,
                'message' => $message->repliedMessage->message,
                'sender' => $message->repliedMessage->sender ? [
                    'id' => $message->repliedMessage->sender->id,
                    'first_name' => $message->repliedMessage->sender->first_name,
                    'last_name' => $message->repliedMessage->sender->last_name,
                ] : null,
            ] : null,
            'is_edited' => $message->is_edited,
            'edited_at' => $message->edited_at?->toISOString(),
            'created_at' => $message->created_at->toISOString(),
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'first_name' => $message->sender->first_name,
                'last_name' => $message->sender->last_name,
                'username' => $message->sender->username,
                'profile_image' => $message->sender->profile_image_url,
            ] : null,
        ];
    }
}
