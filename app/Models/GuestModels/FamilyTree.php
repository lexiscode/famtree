<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FamilyTree extends Model
{
    use SoftDeletes;

    protected $table = 'family_trees';

    protected $fillable = [
        'root_user_id',
        'tree_name',
        'description',
        'is_public',
        'created_by_user_id',
        'is_nuclear_family',
        'merged_tree_ids',
        'merged_into_tree_id',
        'merged_at',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'is_nuclear_family' => 'boolean',
        'merged_tree_ids' => 'array',
        'merged_at' => 'datetime',
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

    /**
     * Get all admins of this family tree
     */
    public function admins(): HasMany
    {
        return $this->hasMany(FamilyTreeAdmin::class, 'family_tree_id');
    }

    /**
     * Get the tree this was merged into
     */
    public function mergedInto(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class, 'merged_into_tree_id');
    }

    /**
     * Get all connection requests sent by this tree
     */
    public function sentConnectionRequests(): HasMany
    {
        return $this->hasMany(FamilyTreeConnection::class, 'requester_tree_id');
    }

    /**
     * Get all connection requests received by this tree
     */
    public function receivedConnectionRequests(): HasMany
    {
        return $this->hasMany(FamilyTreeConnection::class, 'recipient_tree_id');
    }

    /**
     * Check if this tree has been merged into another tree
     *
     * @return bool
     */
    public function isMerged(): bool
    {
        return !is_null($this->merged_into_tree_id);
    }

    /**
     * Check if this tree is designated as a nuclear family tree
     *
     * @return bool
     */
    public function isNuclearFamily(): bool
    {
        return $this->is_nuclear_family;
    }

    /**
     * Get the creator admin of this tree
     *
     * @return \App\Models\GuestModels\FamilyTreeAdmin|null
     */
    public function getCreatorAdmin()
    {
        return $this->admins()->where('role', 'creator')->first();
    }
}
