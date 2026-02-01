<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TreeChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'family_tree_id',
        'user_id',
        'message',
        'is_read',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the family tree that owns the message
     */
    public function familyTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class);
    }

    /**
     * Get the user who sent the message
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
