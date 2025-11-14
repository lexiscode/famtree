<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyTreeMember extends Model
{
    protected $table = 'family_tree_members';

    protected $fillable = [
        'family_tree_id',
        'user_id',
        'added_by_user_id',
        'added_at',
    ];

    protected $casts = [
        'added_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the family tree this member belongs to
     */
    public function familyTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class, 'family_tree_id');
    }

    /**
     * Get the user in this family tree
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who added this member
     */
    public function addedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'added_by_user_id');
    }
}
