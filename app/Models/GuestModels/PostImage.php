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
        // Debug: Log what we receive
        \Log::info('PostImage getImageUrlAttribute called', [
            'value' => $value,
            'attributes' => $this->attributes,
            'image_url_from_db' => $this->attributes['image_url'] ?? 'NOT SET'
        ]);

        // Get the raw value from database
        $rawValue = $this->attributes['image_url'] ?? null;

        // If it's already a full URL, return as-is
        if (filter_var($rawValue, FILTER_VALIDATE_URL)) {
            return $rawValue;
        }

        // If empty, return empty
        if (empty($rawValue)) {
            \Log::warning('PostImage URL is empty', ['post_id' => $this->post_id]);
            return '';
        }

        // Prepend the public storage URL
        $fullUrl = url('storage/' . ltrim($rawValue, '/'));
        \Log::info('PostImage URL generated', ['raw' => $rawValue, 'full' => $fullUrl]);
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
