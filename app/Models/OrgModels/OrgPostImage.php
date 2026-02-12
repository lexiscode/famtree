<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class OrgPostImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'org_post_id',
        'image_url',
        'order',
    ];

    protected $casts = [
        'order' => 'integer',
    ];

    protected $appends = ['full_image_url'];

    public function post()
    {
        return $this->belongsTo(OrgPost::class, 'org_post_id');
    }

    public function getFullImageUrlAttribute(): ?string
    {
        if ($this->image_url) {
            if (str_starts_with($this->image_url, 'http')) {
                return $this->image_url;
            }
            if (str_starts_with($this->image_url, '/')) {
                return $this->image_url;
            }
            return Storage::disk('public')->url($this->image_url);
        }
        return null;
    }
}
