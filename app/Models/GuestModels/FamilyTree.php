<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FamilyTree extends Model
{
    protected $table = 'family_trees';

    protected $fillable = [
        'root_user_id',
        'tree_name',
        'description',
        'is_public',
        'created_by_user_id',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the root user of this family tree
     */
    public function rootUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'root_user_id');
    }

    /**
     * Get the user who created this family tree
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get all members of this family tree
     */
    public function members(): HasMany
    {
        return $this->hasMany(FamilyTreeMember::class, 'family_tree_id');
    }

    /**
     * Get all users in this family tree
     */
    public function users()
    {
        return $this->belongsToMany(
            User::class,
            'family_tree_members',
            'family_tree_id',
            'user_id'
        )
        ->withPivot('added_by_user_id', 'added_at')
        ->withTimestamps();
    }
}
