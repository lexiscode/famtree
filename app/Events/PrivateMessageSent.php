<?php

namespace App\Events;

use App\Models\GuestModels\PrivateMessage;
use App\Models\GuestModels\Conversation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PrivateMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public PrivateMessage $message;
    public Conversation $conversation;

    public function __construct(PrivateMessage $message, Conversation $conversation)
    {
        $this->message = $message;
        $this->conversation = $conversation;
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('private-messages.' . $this->conversation->user_one_id),
            new PrivateChannel('private-messages.' . $this->conversation->user_two_id),
        ];
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender:id,first_name,last_name,profile_image_url');

        return [
            'conversation_uuid' => $this->conversation->uuid,
            'message' => [
                'id' => $this->message->id,
                'conversation_id' => $this->message->conversation_id,
                'sender_id' => $this->message->sender_id,
                'message' => $this->message->message,
                'is_read' => $this->message->is_read,
                'created_at' => $this->message->created_at->toISOString(),
                'sender' => [
                    'id' => $this->message->sender->id,
                    'first_name' => $this->message->sender->first_name,
                    'last_name' => $this->message->sender->last_name,
                    'profile_image_url' => $this->message->sender->profile_image_url,
                ],
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'PrivateMessageSent';
    }
}
