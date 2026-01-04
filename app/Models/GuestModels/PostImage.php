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
        // If it's already a full URL, return as-is
        if (filter_var($value, FILTER_VALIDATE_URL)) {
            return $value;
        }

        // If empty, return empty
        if (empty($value)) {
            return '';
        }

        // Prepend the public storage URL
        return url('storage/' . ltrim($value, '/'));
    }

    /**
     * Get the post this image belongs to
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
