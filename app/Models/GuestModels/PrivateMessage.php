<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrivateMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'sender_id',
        'message',
        'is_delivered',
        'delivered_at',
        'is_read',
        'read_at',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_delivered' => 'boolean',
        'delivered_at' => 'datetime',
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the conversation this message belongs to
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender of this message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Mark this message as delivered
     */
    public function markAsDelivered(): void
    {
        if (!$this->is_delivered) {
            $this->update([
                'is_delivered' => true,
                'delivered_at' => now(),
            ]);
        }
    }

    /**
     * Mark this message as read
     */
    public function markAsRead(): void
    {
        if (!$this->is_read) {
            $this->update([
                'is_delivered' => true,
                'delivered_at' => $this->delivered_at ?? now(),
                'is_read' => true,
                'read_at' => now(),
            ]);
        }
    }
}
