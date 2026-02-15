<?php

namespace App\Events;

use App\Models\GuestModels\GlamSquad;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class GlamSquadUserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public GlamSquad $squad;
    public $user;

    public function __construct(GlamSquad $squad, $user)
    {
        $this->squad = $squad;
        $this->user = $user;
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('glam-squad.' . $this->squad->uuid),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'username' => $this->user->username,
            ],
            'squad_uuid' => $this->squad->uuid,
        ];
    }

    public function broadcastAs(): string
    {
        return 'GlamSquadUserTyping';
    }
}
