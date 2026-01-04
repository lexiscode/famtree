<?php

namespace App\Events;

use App\Models\GuestModels\TreeChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TreeMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public TreeChatMessage $message;

    /**
     * Create a new event instance.
     */
    public function __construct(TreeChatMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Load the family tree relationship to get the UUID
        $this->message->loadMissing('familyTree');

        return [
            new PresenceChannel('family-tree.' . $this->message->familyTree->uuid),
        ];
    }

    /**
     * Get the data to broadcast.
     *
     * @return array
     */
    public function broadcastWith(): array
    {
        // Load user relationship if not already loaded
        $this->message->loadMissing('user');

        // Wrap data in 'message' key to match frontend expectations
        return [
            'message' => [
                'id' => $this->message->id,
                'family_tree_id' => $this->message->family_tree_id,
                'user_id' => $this->message->user_id,
                'message' => $this->message->message,
                'created_at' => $this->message->created_at->toISOString(),
                'user' => [
                    'id' => $this->message->user->id,
                    'first_name' => $this->message->user->first_name,
                    'last_name' => $this->message->user->last_name,
                    'profile_image_url' => $this->message->user->profile_image_url,
                ],
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
        return 'TreeMessageSent';
    }
}
