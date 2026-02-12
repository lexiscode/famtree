<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrgRole extends Model
{
    protected $table = 'org_roles';

    protected $fillable = [
        'organization_id',
        'name',
        'slug',
        'is_system',
        'permissions',
    ];

    protected $casts = [
        'permissions' => 'json',
        'is_system' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function accounts()
    {
        return $this->hasMany(OrgAccount::class, 'org_role_id');
    }

    public function isOwnerRole(): bool
    {
        return $this->is_system && $this->slug === 'owner';
    }

    public function hasPermission(string $permission): bool
    {
        if ($this->isOwnerRole()) {
            return true;
        }

        $permissions = $this->permissions ?? [];

        return !empty($permissions[$permission]) || !empty($permissions['*']);
    }
}
