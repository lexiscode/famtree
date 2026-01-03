<?php

namespace App\Events;

use App\Models\GuestModels\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TreeUserTyping implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $familyTreeId;
    public User $user;
    public bool $isTyping;

    /**
     * Create a new event instance.
     */
    public function __construct(int $familyTreeId, User $user, bool $isTyping)
    {
        $this->familyTreeId = $familyTreeId;
        $this->user = $user;
        $this->isTyping = $isTyping;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        // Get the tree UUID from the numeric ID
        $tree = \App\Models\GuestModels\FamilyTree::find($this->familyTreeId);

        if (!$tree) {
            return [];
        }

        return [
            new PresenceChannel('family-tree.' . $tree->uuid),
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
            'user_id' => $this->user->id,
            'first_name' => $this->user->first_name,
            'last_name' => $this->user->last_name,
            'is_typing' => $this->isTyping,
        ];
    }

    /**
     * The event's broadcast name.
     *
     * @return string
     */
    public function broadcastAs(): string
    {
        return 'TreeUserTyping';
    }
}
