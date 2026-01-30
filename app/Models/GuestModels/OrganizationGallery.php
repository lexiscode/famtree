<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OrganizationGallery extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'image_path',
        'caption',
        'display_order',
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    protected $appends = [
        'image_url',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function getImageUrlAttribute()
    {
        if ($this->image_path) {
            if (str_starts_with($this->image_path, 'http')) {
                return $this->image_path;
            }
            return Storage::disk('public')->url($this->image_path);
        }
        return null;
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('display_order');
    }
}
