<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FamilyTreeAdmin extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'family_tree_admins';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'family_tree_id',
        'user_id',
        'role',
        'granted_at',
        'granted_by_user_id',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'granted_at' => 'datetime',
    ];

    /**
     * Get the family tree this admin belongs to.
     */
    public function familyTree(): BelongsTo
    {
        return $this->belongsTo(FamilyTree::class, 'family_tree_id');
    }

    /**
     * Get the user who is the admin.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who granted admin rights.
     */
    public function grantedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'granted_by_user_id');
    }

    /**
     * Check if this admin is the creator of the tree.
     *
     * @return bool
     */
    public function isCreator(): bool
    {
        return $this->role === 'creator';
    }

    /**
     * Check if this admin is a co-admin.
     *
     * @return bool
     */
    public function isCoAdmin(): bool
    {
        return $this->role === 'co_admin';
    }
}
