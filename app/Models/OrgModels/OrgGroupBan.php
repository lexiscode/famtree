<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Model;

class OrgGroupBan extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'org_group_id',
        'user_id',
        'reason',
        'banned_by',
        'banned_at',
        'expires_at',
    ];

    protected $casts = [
        'banned_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function banner()
    {
        return $this->belongsTo(OrgAccount::class, 'banned_by');
    }

    public function isActive(): bool
    {
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        return true;
    }
}
