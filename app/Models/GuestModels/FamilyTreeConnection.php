<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyTreeConnection extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'family_tree_connections';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_tree_id',
        'recipient_tree_id',
        'status',
        'requested_at',
        'accepted_at',
        'requested_by_user_id',
        'accepted_by_user_id',
        'message',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requested_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    /**
     * Get the tree that sent the connection request.
     */
    public function requesterTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class, 'requester_tree_id');
    }

    /**
     * Get the tree that received the connection request.
     */
    public function recipientTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class, 'recipient_tree_id');
    }

    /**
     * Get the user who sent the connection request.
     */
    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by_user_id');
    }

    /**
     * Get the user who accepted the connection request.
     */
    public function acceptedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'accepted_by_user_id');
    }

    /**
     * Check if the connection is pending.
     *
     * @return bool
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if the connection is accepted.
     *
     * @return bool
     */
    public function isAccepted(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if the connection is declined.
     *
     * @return bool
     */
    public function isDeclined(): bool
    {
        return $this->status === 'declined';
    }
}
