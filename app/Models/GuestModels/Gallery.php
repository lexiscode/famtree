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

    protected $appends = [
        'file_url',
        'thumbnail_url',
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
        // If thumbnail exists, return its URL
        if ($this->thumbnail_path && Storage::disk('public')->exists($this->thumbnail_path)) {
            return Storage::disk('public')->url($this->thumbnail_path);
        }

        // For videos without thumbnails, generate one on-demand
        if ($this->file_type === 'video' && !$this->thumbnail_path && $this->file_path) {
            $this->generateVideoThumbnailOnDemand();
            if ($this->thumbnail_path && Storage::disk('public')->exists($this->thumbnail_path)) {
                return Storage::disk('public')->url($this->thumbnail_path);
            }
        }

        return null;
    }

    /**
     * Generate video thumbnail on demand if it doesn't exist
     */
    private function generateVideoThumbnailOnDemand()
    {
        try {
            if (!$this->isFFmpegAvailable()) {
                return;
            }

            $fullPath = Storage::disk('public')->path($this->file_path);

            if (!file_exists($fullPath)) {
                return;
            }

            // Generate thumbnail filename
            $storagePath = dirname($this->file_path);
            $thumbnailName = pathinfo($this->file_path, PATHINFO_FILENAME) . '_thumb.jpg';
            $thumbnailStoragePath = $storagePath . '/' . $thumbnailName;
            $thumbnailFullPath = Storage::disk('public')->path($thumbnailStoragePath);

            // Skip if thumbnail already exists
            if (file_exists($thumbnailFullPath)) {
                $this->thumbnail_path = $thumbnailStoragePath;
                return;
            }

            // Ensure directory exists
            @mkdir(dirname($thumbnailFullPath), 0755, true);

            // Use FFmpeg to extract first frame
            $command = sprintf(
                'ffmpeg -i %s -ss 00:00:01 -vf scale=320:-1 -frames:v 1 -y %s 2>/dev/null',
                escapeshellarg($fullPath),
                escapeshellarg($thumbnailFullPath)
            );

            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($thumbnailFullPath)) {
                $this->thumbnail_path = $thumbnailStoragePath;
                $this->save();
            }
        } catch (\Exception $e) {
            // Silently fail
        }
    }

    /**
     * Check if FFmpeg is available
     */
    private function isFFmpegAvailable(): bool
    {
        $command = 'which ffmpeg 2>/dev/null || where ffmpeg 2>nul';
        exec($command, $output, $returnCode);
        return $returnCode === 0;
    }
}
