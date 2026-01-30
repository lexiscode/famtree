<?php

namespace App\Events;

use App\Models\GuestModels\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDelivered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Conversation $conversation;
    public int $deliveredToUserId;

    public function __construct(Conversation $conversation, int $deliveredToUserId)
    {
        $this->conversation = $conversation;
        $this->deliveredToUserId = $deliveredToUserId;
    }

    public function broadcastOn(): array
    {
        $otherUserId = $this->conversation->user_one_id === $this->deliveredToUserId
            ? $this->conversation->user_two_id
            : $this->conversation->user_one_id;

        return [new PrivateChannel('private-messages.' . $otherUserId)];
    }

    public function broadcastWith(): array
    {
        return [
            'conversation_uuid' => $this->conversation->uuid,
            'delivered_to_user_id' => $this->deliveredToUserId,
        ];
    }

    public function broadcastAs(): string
    {
        return 'MessageDelivered';
    }
}
