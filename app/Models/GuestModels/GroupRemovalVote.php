<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;

class GroupRemovalVote extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'removal_id',
        'admin_user_id',
        'vote',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function removal()
    {
        return $this->belongsTo(GroupMemberRemoval::class, 'removal_id');
    }

    public function adminUser()
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
