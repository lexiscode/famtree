<?php

namespace App\Events;

use App\Models\GuestModels\ClassSetMessage;
use App\Models\GuestModels\ClassSet;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ClassSetMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ClassSetMessage $message;
    public ClassSet $classSet;

    /**
     * Create a new event instance.
     */
    public function __construct(ClassSetMessage $message, ClassSet $classSet)
    {
        $this->message = $message;
        $this->classSet = $classSet;
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
        // Load sender relationship if not already loaded
        $this->message->loadMissing('sender');

        return [
            'message' => [
                'id' => $this->message->id,
                'uuid' => $this->message->uuid,
                'class_set_id' => $this->message->class_set_id,
                'sender_id' => $this->message->sender_id,
                'message' => $this->message->message,
                'created_at' => $this->message->created_at->toISOString(),
                'sender' => [
                    'id' => $this->message->sender->id,
                    'uuid' => $this->message->sender->uuid,
                    'first_name' => $this->message->sender->first_name,
                    'last_name' => $this->message->sender->last_name,
                    'username' => $this->message->sender->username,
                    'profile_image' => $this->message->sender->profile_image_url,
                ],
            ],
            'class_set' => [
                'id' => $this->classSet->id,
                'uuid' => $this->classSet->uuid,
                'name' => $this->classSet->name,
            ],
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'ClassSetMessageSent';
    }
}
