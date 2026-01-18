<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Conversation extends Model
{
    protected $fillable = [
        'uuid',
        'user_one_id',
        'user_two_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Boot method to auto-generate UUID
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the route key name for Laravel route model binding
     */
    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    /**
     * Get user one in the conversation
     */
    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    /**
     * Get user two in the conversation
     */
    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    /**
     * Get all messages in the conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(PrivateMessage::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message in the conversation
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(PrivateMessage::class)->latest();
    }

    /**
     * Get the other participant in the conversation
     */
    public function getOtherUser(int $currentUserId): User
    {
        return $this->user_one_id === $currentUserId ? $this->userTwo : $this->userOne;
    }

    /**
     * Check if a user is a participant in this conversation
     */
    public function hasParticipant(int $userId): bool
    {
        return $this->user_one_id === $userId || $this->user_two_id === $userId;
    }
}
