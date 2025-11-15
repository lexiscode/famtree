<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\Gallery;

class GalleryRepository
{
    /**
     * Get all gallery items for a user
     */
    public function getUserGalleries(int $userId, int $perPage = 12)
    {
        return Gallery::where('user_id', $userId)
            ->orderBy('uploaded_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get a specific gallery item
     */
    public function find(int $id): ?Gallery
    {
        return Gallery::find($id);
    }

    /**
     * Get a specific gallery item by user and id
     */
    public function findByUserAndId(int $userId, int $galleryId): ?Gallery
    {
        return Gallery::where('user_id', $userId)
            ->where('id', $galleryId)
            ->first();
    }

    /**
     * Create a new gallery item
     */
    public function create(int $userId, array $data): Gallery
    {
        return Gallery::create([
            'user_id' => $userId,
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'file_path' => $data['file_path'],
            'file_type' => $data['file_type'],
            'mime_type' => $data['mime_type'],
            'file_size' => $data['file_size'] ?? null,
            'thumbnail_path' => $data['thumbnail_path'] ?? null,
            'uploaded_at' => now(),
        ]);
    }

    /**
     * Update a gallery item
     */
    public function update(int $id, array $data): Gallery
    {
        $gallery = Gallery::findOrFail($id);
        $gallery->update($data);
        return $gallery;
    }

    /**
     * Delete a gallery item
     */
    public function delete(int $id): bool
    {
        return Gallery::destroy($id) > 0;
    }

    /**
     * Get total count of gallery items for a user
     */
    public function countByUser(int $userId): int
    {
        return Gallery::where('user_id', $userId)->count();
    }

    /**
     * Get gallery items grouped by type
     */
    public function getByType(int $userId, string $fileType)
    {
        return Gallery::where('user_id', $userId)
            ->where('file_type', $fileType)
            ->orderBy('uploaded_at', 'desc')
            ->get();
    }
}
