<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use App\Notifications\OrgResetPasswordNotification;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;

class OrgAccount extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $guard = 'org';

    protected $fillable = [
        'uuid',
        'organization_id',
        'username',
        'email',
        'password',
        'org_role_id',
        'display_name',
        'linked_org_group_id',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'password' => 'hashed',
        'is_active' => 'boolean',
        'last_login_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new OrgResetPasswordNotification($token));
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(OrgActivityLog::class);
    }

    public function posts()
    {
        return $this->hasMany(OrgPost::class);
    }

    public function broadcasts()
    {
        return $this->hasMany(OrgBroadcast::class);
    }

    public function orgRole()
    {
        return $this->belongsTo(OrgRole::class, 'org_role_id');
    }

    public function linkedOrgGroup()
    {
        return $this->belongsTo(OrgGroup::class, 'linked_org_group_id');
    }

    public function isOwner(): bool
    {
        return $this->orgRole?->isOwnerRole() ?? false;
    }

    public function hasPermission(string $permission): bool
    {
        return $this->orgRole?->hasPermission($permission) ?? false;
    }

    public function getRoleNameAttribute(): string
    {
        return $this->orgRole?->name ?? 'Unknown';
    }
}
