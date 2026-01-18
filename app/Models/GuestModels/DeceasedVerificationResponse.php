<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DeceasedVerificationResponse extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'verification_id',
        'responder_id',
        'relationship_type',
        'response',
        'responded_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'responded_at' => 'datetime',
    ];

    /**
     * Get the verification this response belongs to.
     */
    public function verification()
    {
        return $this->belongsTo(DeceasedVerification::class, 'verification_id');
    }

    /**
     * Get the family member who responded.
     */
    public function responder()
    {
        return $this->belongsTo(User::class, 'responder_id');
    }

    /**
     * Check if response indicates deceased.
     */
    public function indicatesDeceased(): bool
    {
        return $this->response === 'deceased';
    }

    /**
     * Check if response indicates alive.
     */
    public function indicatesAlive(): bool
    {
        return $this->response === 'alive';
    }

    /**
     * Check if response is unknown.
     */
    public function isUnknown(): bool
    {
        return $this->response === 'unknown';
    }
}
