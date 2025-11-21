<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\GalleryService;
use App\Models\GuestModels\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function __construct(private GalleryService $galleryService)
    {
    }

    /**
     * Display the user's galleries
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $galleries = $this->galleryService->getFormattedGalleries($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Galleries/Index', [
            'galleries' => $galleries['items'],
            'total' => $galleries['total'],
            'per_page' => $galleries['per_page'],
            'current_page' => $galleries['current_page'],
            'last_page' => $galleries['last_page'],
            'count' => $galleries['count'],
        ]);
    }

    /**
     * View another user's galleries
     */
    public function viewUser(Request $request, int $userId)
    {
        $viewer = $request->user();

        // Check if users are connected
        $targetUser = User::findOrFail($userId);

        $galleries = $this->galleryService->getFormattedGalleries($userId);
        $userName = trim(($targetUser->first_name ?? '') . ' ' . ($targetUser->last_name ?? ''));

        return Inertia::render('GuestPages/AuthAccessPages/Galleries/ViewUser', [
            'galleries' => $galleries['items'],
            'total' => $galleries['total'],
            'count' => $galleries['count'],
            'userName' => $userName,
            'userId' => $userId,
        ]);
    }

    /**
     * Upload a new gallery file
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'file' => 'required|file|mimes:jpeg,png,gif,webp,mp4,webm,quicktime|max:51200',
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string|max:1000',
            ]);

            $result = $this->galleryService->uploadFile(
                $userId,
                $request->file('file'),
                $validated['title'] ?? null,
                $validated['description'] ?? null
            );

            return back()->with([
                'success' => 'File uploaded successfully',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        } catch (\Exception $e) {
            return back()->withErrors([
                'file' => 'Failed to upload file: ' . $e->getMessage(),
            ]);
        }
    }

    /**
     * Delete a gallery item
     */
    public function destroy(Request $request, int $galleryId)
    {
        $userId = $request->user()->id;

        try {
            $this->galleryService->deleteGallery($userId, $galleryId);

            return back()->with([
                'success' => 'Gallery item deleted successfully',
            ]);
        } catch (\Exception $e) {
            return back()->withErrors([
                'error' => $e->getMessage(),
            ]);
        }
    }
}
