<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\GalleryRepository;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\GdDriver;

class GalleryService
{
    public function __construct(private GalleryRepository $galleryRepository)
    {
    }

    /**
     * Get all gallery items for a user
     */
    public function getUserGalleries(int $userId, int $perPage = 12)
    {
        return $this->galleryRepository->getUserGalleries($userId, $perPage);
    }

    /**
     * Upload a gallery file
     */
    public function uploadFile(int $userId, $file, ?string $title = null, ?string $description = null): array
    {
        try {
            // Validate file type
            $validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            $validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
            $allValidTypes = array_merge($validImageTypes, $validVideoTypes);

            if (!in_array($file->getMimeType(), $allValidTypes)) {
                throw ValidationException::withMessages([
                    'file' => ['File type not supported. Allowed: JPG, PNG, GIF, WebP, MP4, WebM, MOV'],
                ]);
            }

            // Validate file size (50MB max)
            $maxSize = 50 * 1024 * 1024;
            if ($file->getSize() > $maxSize) {
                throw ValidationException::withMessages([
                    'file' => ['File size should not exceed 50MB'],
                ]);
            }

            // Determine file type
            $fileType = in_array($file->getMimeType(), $validImageTypes) ? 'image' : 'video';

            // Store the file
            $storagePath = 'galleries/' . $userId;
            $filePath = $file->store($storagePath, 'public');

            // Generate thumbnail for videos
            $thumbnailPath = null;
            if ($fileType === 'video') {
                $thumbnailPath = $this->generateVideoThumbnail($filePath, $storagePath, $userId);
            }

            // Create gallery record
            $galleryData = [
                'title' => $title,
                'description' => $description,
                'file_path' => $filePath,
                'file_type' => $fileType,
                'mime_type' => $file->getMimeType(),
                'file_size' => $file->getSize(),
                'thumbnail_path' => $thumbnailPath,
            ];

            $gallery = $this->galleryRepository->create($userId, $galleryData);

            return [
                'success' => true,
                'message' => 'File uploaded successfully',
                'gallery' => $gallery,
            ];
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw ValidationException::withMessages([
                'file' => ['Failed to upload file: ' . $e->getMessage()],
            ]);
        }
    }

    /**
     * Delete a gallery item
     */
    public function deleteGallery(int $userId, int $galleryId): bool
    {
        $gallery = $this->galleryRepository->findByUserAndId($userId, $galleryId);

        if (!$gallery) {
            throw ValidationException::withMessages([
                'gallery' => ['Gallery item not found'],
            ]);
        }

        // Delete the file from storage
        if (Storage::disk('public')->exists($gallery->file_path)) {
            Storage::disk('public')->delete($gallery->file_path);
        }

        // Delete thumbnail if exists
        if ($gallery->thumbnail_path && Storage::disk('public')->exists($gallery->thumbnail_path)) {
            Storage::disk('public')->delete($gallery->thumbnail_path);
        }

        return $this->galleryRepository->delete($galleryId);
    }

    /**
     * Get gallery item details
     */
    public function getGalleryItem(int $userId, int $galleryId): ?array
    {
        $gallery = $this->galleryRepository->findByUserAndId($userId, $galleryId);

        if (!$gallery) {
            return null;
        }

        return [
            'id' => $gallery->id,
            'title' => $gallery->title,
            'description' => $gallery->description,
            'file_url' => $gallery->file_url,
            'thumbnail_url' => $gallery->thumbnail_url,
            'file_type' => $gallery->file_type,
            'file_size' => $gallery->file_size,
            'uploaded_at' => $gallery->uploaded_at,
        ];
    }

    /**
     * Get formatted gallery items for display
     */
    public function getFormattedGalleries(int $userId, int $perPage = 12): array
    {
        $galleries = $this->getUserGalleries($userId, $perPage);

        return [
            'items' => $galleries->items(),
            'total' => $galleries->total(),
            'per_page' => $galleries->perPage(),
            'current_page' => $galleries->currentPage(),
            'last_page' => $galleries->lastPage(),
            'count' => $this->galleryRepository->countByUser($userId),
        ];
    }

    /**
     * Generate a thumbnail from the first frame of a video
     */
    private function generateVideoThumbnail(string $videoPath, string $storagePath, int $userId): ?string
    {
        try {
            $fullPath = Storage::disk('public')->path($videoPath);

            // Check if FFmpeg is available
            if (!$this->isFFmpegAvailable()) {
                return null;
            }

            // Generate thumbnail filename
            $thumbnailName = pathinfo($videoPath, PATHINFO_FILENAME) . '_thumb.jpg';
            $thumbnailStoragePath = $storagePath . '/' . $thumbnailName;
            $thumbnailFullPath = Storage::disk('public')->path($thumbnailStoragePath);

            // Ensure directory exists
            @mkdir(dirname($thumbnailFullPath), 0755, true);

            // Use FFmpeg to extract first frame
            $command = sprintf(
                'ffmpeg -i %s -ss 00:00:01 -vf scale=320:-1 -frames:v 1 %s 2>/dev/null',
                escapeshellarg($fullPath),
                escapeshellarg($thumbnailFullPath)
            );

            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($thumbnailFullPath)) {
                return $thumbnailStoragePath;
            }

            return null;
        } catch (\Exception $e) {
            // If thumbnail generation fails, return null
            return null;
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
