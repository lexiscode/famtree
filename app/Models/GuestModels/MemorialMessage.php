<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MemorialMessage extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'author_id',
        'relationship_type',
        'message',
        'is_approved',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the deceased user this message is for.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the family member who wrote this message.
     */
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    /**
     * Scope: approved messages only.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Scope: for specific deceased user.
     */
    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: by specific author.
     */
    public function scopeByAuthor($query, int $authorId)
    {
        return $query->where('author_id', $authorId);
    }
}
