<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
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
        'role',
        'permissions',
        'display_name',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'permissions' => 'json',
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

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->role === 'owner') {
            return true;
        }

        $permissions = $this->permissions ?? [];

        return !empty($permissions[$permission]) || !empty($permissions['*']);
    }
}
