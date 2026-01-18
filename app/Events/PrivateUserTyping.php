<?php

namespace App\Events;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PrivateUserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public string $conversationUuid;
    public User $user;
    public bool $isTyping;

    public function __construct(string $conversationUuid, User $user, bool $isTyping)
    {
        $this->conversationUuid = $conversationUuid;
        $this->user = $user;
        $this->isTyping = $isTyping;
    }

    public function broadcastOn(): array
    {
        $conversation = Conversation::where('uuid', $this->conversationUuid)->first();
        if (!$conversation) {
            return [];
        }

        $otherUserId = $conversation->user_one_id === $this->user->id
            ? $conversation->user_two_id
            : $conversation->user_one_id;

        return [new PrivateChannel('private-messages.' . $otherUserId)];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_uuid' => $this->conversationUuid,
            'user_id' => $this->user->id,
            'first_name' => $this->user->first_name,
            'last_name' => $this->user->last_name,
            'is_typing' => $this->isTyping,
        ];
    }

    public function broadcastAs(): string
    {
        return 'PrivateUserTyping';
    }
}
