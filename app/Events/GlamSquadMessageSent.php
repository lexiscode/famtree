<?php

namespace App\Events;

use App\Models\GuestModels\GlamSquadMessage;
use App\Models\GuestModels\GlamSquad;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GlamSquadMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public GlamSquadMessage $message;
    public GlamSquad $squad;

    public function __construct(GlamSquadMessage $message, GlamSquad $squad)
    {
        $this->message = $message;
        $this->squad = $squad;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('glam-squad.' . $this->squad->uuid),
        ];
    }

    public function broadcastWith(): array
    {
        $this->message->loadMissing('sender');

        return [
            'message' => [
                'id' => $this->message->id,
                'uuid' => $this->message->uuid,
                'squad_id' => $this->message->squad_id,
                'sender_id' => $this->message->sender_id,
                'message' => $this->message->message,
                'created_at' => $this->message->created_at->toISOString(),
                'sender' => [
                    'id' => $this->message->sender->id,
                    'first_name' => $this->message->sender->first_name,
                    'last_name' => $this->message->sender->last_name,
                    'username' => $this->message->sender->username,
                    'profile_image' => $this->message->sender->profile_image_url,
                ],
            ],
            'squad' => [
                'id' => $this->squad->id,
                'uuid' => $this->squad->uuid,
                'name' => $this->squad->name,
            ],
        ];
    }

    public function broadcastAs(): string
    {
        return 'GlamSquadMessageSent';
    }
}
