<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Model;

class OrgGroupMember extends Model
{
    protected $table = 'org_group_members';

    protected $fillable = [
        'org_group_id',
        'user_id',
        'role',
        'added_by_type',
        'added_by_id',
        'is_active',
        'joined_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'joined_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isLeader(): bool
    {
        return in_array($this->role, ['president', 'vice_president', 'secretary', 'treasurer', 'pro', 'social_director']);
    }

    public function isTopLeader(): bool
    {
        return in_array($this->role, ['president', 'vice_president']);
    }

    public static function roleLabel(string $role): string
    {
        return match ($role) {
            'president' => 'President',
            'vice_president' => 'Vice President',
            'secretary' => 'Secretary',
            'treasurer' => 'Treasurer',
            'pro' => 'PRO',
            'social_director' => 'Social Director',
            'member' => 'Member',
            default => ucfirst(str_replace('_', ' ', $role)),
        };
    }
}
