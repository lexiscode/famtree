<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GlamSquad extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'name',
        'gender_track',
        'squad_number',
        'member_cap',
        'is_active',
    ];

    protected $casts = [
        'squad_number' => 'integer',
        'member_cap' => 'integer',
        'is_active' => 'boolean',
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

    public function members()
    {
        return $this->hasMany(GlamSquadMember::class, 'squad_id');
    }

    public function messages()
    {
        return $this->hasMany(GlamSquadMessage::class, 'squad_id');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'glam_squad_members', 'squad_id', 'user_id')
            ->withPivot(['is_admin', 'is_muted', 'joined_at'])
            ->withTimestamps();
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getMemberCount(): int
    {
        return $this->members()->count();
    }

    public function isFull(): bool
    {
        return $this->getMemberCount() >= $this->member_cap;
    }

    public function isMember(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }
}
