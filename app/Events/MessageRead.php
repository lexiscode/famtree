<?php

namespace App\Events;

use App\Models\GuestModels\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Conversation $conversation;
    public int $readByUserId;

    public function __construct(Conversation $conversation, int $readByUserId)
    {
        $this->conversation = $conversation;
        $this->readByUserId = $readByUserId;
    }

    public function broadcastOn(): array
    {
        $otherUserId = $this->conversation->user_one_id === $this->readByUserId
            ? $this->conversation->user_two_id
            : $this->conversation->user_one_id;

        return [new PrivateChannel('private-messages.' . $otherUserId)];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_uuid' => $this->conversation->uuid,
            'read_by_user_id' => $this->readByUserId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageRead';
    }
}
