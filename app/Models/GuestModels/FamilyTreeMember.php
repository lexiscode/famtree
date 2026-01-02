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
        'nuclear_family_role',
        'can_add_members',
    ];

    protected $casts = [
        'added_at' => 'datetime',
        'can_add_members' => 'boolean',
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

    /**
     * Check if this member is a nuclear family member (spouse or child)
     *
     * @return bool
     */
    public function isNuclearFamilyMember(): bool
    {
        return in_array($this->nuclear_family_role, ['spouse', 'child']);
    }

    /**
     * Check if this member can add other members to the tree
     *
     * @return bool
     */
    public function canAddMembers(): bool
    {
        return $this->can_add_members;
    }

    /**
     * Check if this member is a spouse
     *
     * @return bool
     */
    public function isSpouse(): bool
    {
        return $this->nuclear_family_role === 'spouse';
    }

    /**
     * Check if this member is a child
     *
     * @return bool
     */
    public function isChild(): bool
    {
        return $this->nuclear_family_role === 'child';
    }

    /**
     * Check if this member is from a merged tree
     *
     * @return bool
     */
    public function isFromMergedTree(): bool
    {
        return $this->nuclear_family_role === 'merged';
    }
}
