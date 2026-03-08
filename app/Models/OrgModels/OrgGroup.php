<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrgGroup extends Model
{
    protected $table = 'org_groups';

    protected $fillable = [
        'uuid',
        'organization_id',
        'parent_group_id',
        'name',
        'slug',
        'description',
        'type',
        'is_active',
        'max_members',
        'allow_join_requests',
        'is_suspended',
        'suspension_reason',
        'suspended_at',
        'suspended_by',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'allow_join_requests' => 'boolean',
        'is_suspended' => 'boolean',
        'suspended_at' => 'datetime',
        'max_members' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function parentGroup()
    {
        return $this->belongsTo(self::class, 'parent_group_id');
    }

    public function alumniGroups()
    {
        return $this->hasMany(self::class, 'parent_group_id');
    }

    public function members()
    {
        return $this->hasMany(OrgGroupMember::class);
    }

    public function activeMembers()
    {
        return $this->hasMany(OrgGroupMember::class)->where('is_active', true);
    }

    public function leadershipTerms()
    {
        return $this->hasMany(OrgGroupLeadershipTerm::class);
    }

    public function creator()
    {
        return $this->belongsTo(OrgAccount::class, 'created_by');
    }

    public function getLeaders()
    {
        return $this->activeMembers()->where('role', '!=', 'member')->get();
    }

    public function joinRequests()
    {
        return $this->hasMany(OrgGroupJoinRequest::class);
    }

    public function pendingJoinRequests()
    {
        return $this->hasMany(OrgGroupJoinRequest::class)->where('status', 'pending');
    }

    public function bans()
    {
        return $this->hasMany(OrgGroupBan::class);
    }

    public function autoRules()
    {
        return $this->hasMany(OrgGroupAutoRule::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
