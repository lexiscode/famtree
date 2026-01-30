<?php

namespace App\Events;

use App\Models\GuestModels\ClassSet;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassSetUserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ClassSet $classSet;
    public $user;

    /**
     * Create a new event instance.
     */
    public function __construct(ClassSet $classSet, $user)
    {
        $this->classSet = $classSet;
        $this->user = $user;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('class-set.' . $this->classSet->uuid),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        return [
            'user' => [
                'id' => $this->user->id,
                'uuid' => $this->user->uuid,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'username' => $this->user->username,
            ],
            'class_set_uuid' => $this->classSet->uuid,
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'ClassSetUserTyping';
    }
}
