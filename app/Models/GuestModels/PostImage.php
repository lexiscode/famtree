<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostImage extends Model
{
    use HasFactory;

    protected $table = 'post_images';

    protected $fillable = [
        'post_id',
        'image_url',
        'order',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the full URL for the image
     * Override the database attribute to prepend storage path
     */
    public function getImageUrlAttribute($value)
    {
        // Get the raw value from database
        $rawValue = $this->attributes['image_url'] ?? null;

        // If empty, return empty
        if (empty($rawValue)) {
            return '';
        }

        // If it's already a full URL, fix double storage path issue
        if (filter_var($rawValue, FILTER_VALIDATE_URL)) {
            // Fix double storage path: /storage/storage/ -> /storage/
            return str_replace('/storage/storage/', '/storage/', $rawValue);
        }

        // If it's a relative path, prepend the storage URL
        $fullUrl = url('storage/' . ltrim($rawValue, '/'));
        return $fullUrl;
    }

    /**
     * Get the post this image belongs to
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
