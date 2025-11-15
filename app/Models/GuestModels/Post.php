<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'content',
        'voice_url',
        'voice_duration',
        'views_count',
        'comments_count',
        'reactions_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the user that created this post
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get all comments on this post
     */
    public function comments()
    {
        return $this->hasMany(PostComment::class);
    }

    /**
     * Get all reactions on this post
     */
    public function reactions()
    {
        return $this->hasMany(PostReaction::class);
    }

    /**
     * Get all images for this post
     */
    public function images()
    {
        return $this->hasMany(PostImage::class)->orderBy('order');
    }
}
