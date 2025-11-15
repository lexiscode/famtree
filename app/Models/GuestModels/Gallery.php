<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Gallery extends Model
{
    use HasFactory;

    protected $table = 'galleries';

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'file_path',
        'file_type',
        'mime_type',
        'file_size',
        'thumbnail_path',
        'uploaded_at',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    /**
     * Get the user that owns this gallery item
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the full URL for the gallery file
     */
    public function getFileUrlAttribute()
    {
        if ($this->file_path) {
            return Storage::disk('public')->url($this->file_path);
        }
        return null;
    }

    /**
     * Get the full URL for the thumbnail
     */
    public function getThumbnailUrlAttribute()
    {
        if ($this->thumbnail_path) {
            return Storage::disk('public')->url($this->thumbnail_path);
        }
        return null;
    }
}
