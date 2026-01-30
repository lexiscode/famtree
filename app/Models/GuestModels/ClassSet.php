<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ClassSet extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'department_id',
        'year',
        'name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'year' => 'integer',
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

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function members()
    {
        return $this->hasMany(ClassSetMember::class);
    }

    public function messages()
    {
        return $this->hasMany(ClassSetMessage::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'class_set_members')
            ->withPivot(['joined_at', 'is_admin'])
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

    public function isMember(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    public function getLatestMessage()
    {
        return $this->messages()->latest()->first();
    }
}
