<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Organization extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'category_id',
        'name',
        'slug',
        'short_name',
        'description',
        'vision',
        'mission',
        'logo',
        'cover_image',
        'address',
        'city',
        'state',
        'country',
        'website',
        'email',
        'phone',
        'founded_year',
        'leader_name',
        'leader_title',
        'leader_qualifications',
        'leader_image',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'founded_year' => 'integer',
    ];

    protected $appends = [
        'logo_url',
        'cover_image_url',
        'leader_image_url',
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

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category()
    {
        return $this->belongsTo(OrganizationCategory::class, 'category_id');
    }

    public function faculties()
    {
        return $this->hasMany(Faculty::class);
    }

    public function galleries()
    {
        return $this->hasMany(OrganizationGallery::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getLogoUrlAttribute()
    {
        if ($this->logo) {
            if (str_starts_with($this->logo, 'http')) {
                return $this->logo;
            }
            // If path starts with /, it's a direct public asset
            if (str_starts_with($this->logo, '/')) {
                return $this->logo;
            }
            return Storage::disk('public')->url($this->logo);
        }
        return null;
    }

    public function getCoverImageUrlAttribute()
    {
        if ($this->cover_image) {
            if (str_starts_with($this->cover_image, 'http')) {
                return $this->cover_image;
            }
            // If path starts with /, it's a direct public asset
            if (str_starts_with($this->cover_image, '/')) {
                return $this->cover_image;
            }
            return Storage::disk('public')->url($this->cover_image);
        }
        return null;
    }

    public function getLeaderImageUrlAttribute()
    {
        if ($this->leader_image) {
            if (str_starts_with($this->leader_image, 'http')) {
                return $this->leader_image;
            }
            // If path starts with /, it's a direct public asset
            if (str_starts_with($this->leader_image, '/')) {
                return $this->leader_image;
            }
            return Storage::disk('public')->url($this->leader_image);
        }
        return null;
    }
}
