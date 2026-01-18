<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class DeceasedVerification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'uuid',
        'user_id',
        'stage',
        'reengagement_sent_at',
        'family_check_sent_at',
        'status_change_scheduled_at',
        'final_status',
        'completed_at',
        'cancelled_at',
        'cancelled_reason',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'reengagement_sent_at' => 'datetime',
        'family_check_sent_at' => 'datetime',
        'status_change_scheduled_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($verification) {
            if (empty($verification->uuid)) {
                $verification->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * Get the user being verified.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the responses for this verification.
     */
    public function responses()
    {
        return $this->hasMany(DeceasedVerificationResponse::class, 'verification_id');
    }

    /**
     * Scope: pending verifications (not completed or cancelled).
     */
    public function scopePending($query)
    {
        return $query->whereNotIn('stage', ['completed', 'cancelled']);
    }

    /**
     * Scope: at specific stage.
     */
    public function scopeAtStage($query, string $stage)
    {
        return $query->where('stage', $stage);
    }

    /**
     * Scope: for specific user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if verification can be cancelled.
     */
    public function canBeCancelled(): bool
    {
        return !in_array($this->stage, ['completed', 'cancelled']);
    }

    /**
     * Check if verification is at pending change stage.
     */
    public function isPendingChange(): bool
    {
        return $this->stage === 'pending_change';
    }

    /**
     * Check if the 30-day waiting period has passed.
     */
    public function waitingPeriodHasPassed(): bool
    {
        if (!$this->status_change_scheduled_at) {
            return false;
        }

        return now()->gte($this->status_change_scheduled_at);
    }
}
