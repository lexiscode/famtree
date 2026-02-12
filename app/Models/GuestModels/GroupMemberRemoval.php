<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMemberRemoval extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_set_id',
        'target_user_id',
        'initiated_by',
        'status',
        'expires_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
    ];

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }

    public function targetUser()
    {
        return $this->belongsTo(User::class, 'target_user_id');
    }

    public function initiator()
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }

    public function votes()
    {
        return $this->hasMany(GroupRemovalVote::class, 'removal_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
