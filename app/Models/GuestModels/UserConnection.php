<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserConnection extends Model
{
    use HasFactory;

    protected $table = 'user_connections';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'requester_user_id',
        'recipient_user_id',
        'relationship_type',
        'status',
        'requested_at',
        'accepted_at',
        'divorced_at',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'requested_at' => 'datetime',
        'accepted_at' => 'datetime',
        'divorced_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    /**
     * Get the user who sent the request
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    /**
     * Get the user who received the request
     */
    public function recipient()
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    /**
     * Get the relationship type
     */
    public function relationshipType()
    {
        return $this->hasOne(RelationshipType::class, 'type_key', 'relationship_type');
    }

    /**
     * Check if connection is active (accepted)
     */
    public function isActive(): bool
    {
        return $this->status === 'accepted';
    }

    /**
     * Check if connection is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if connection can be undone
     * Users can undo accepted connections at any time
     */
    public function canUndo(): bool
    {
        // Allow undo for any accepted connection
        return $this->isActive() && $this->accepted_at !== null;
    }

    /**
     * Check if connection is divorced
     */
    public function isDivorced(): bool
    {
        return $this->divorced_at !== null;
    }

    /**
     * Check if connection can be divorced
     */
    public function canDivorce(): bool
    {
        return $this->isActive()
            && in_array($this->relationship_type, ['wife', 'husband', 'partner'])
            && !$this->isDivorced();
    }
}
