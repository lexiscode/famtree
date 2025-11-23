<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\UpdateProfileVisibilityRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\UpdateFieldPrivacyRequest;
use App\Repositories\GuestRepositories\ProfilePrivacyRepository;
use Illuminate\Http\JsonResponse;

class PrivacyController extends Controller
{
    public function __construct(
        private ProfilePrivacyRepository $privacyRepository,
    ) {}

    /**
     * Update user's profile visibility setting
     */
    public function updateProfileVisibility(UpdateProfileVisibilityRequest $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validated();

        // Update the profile visibility
        $user->update([
            'profile_visibility' => $validated['profile_visibility'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profile visibility updated successfully.',
            'profile_visibility' => $user->profile_visibility,
        ]);
    }

    /**
     * Update field-level privacy settings
     */
    public function updateFieldPrivacy(UpdateFieldPrivacyRequest $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validated();

        // Map the frontend privacy levels to database levels
        $fieldPrivacy = $validated['field_privacy'];
        $mappedSettings = [];

        foreach ($fieldPrivacy as $fieldName => $level) {
            // Convert frontend levels (public, connected, private) to database levels
            $mappedSettings[$fieldName] = match ($level) {
                'public' => 'public',
                'connected' => 'connected_family',
                'private' => 'only_me',
                default => 'public',
            };
        }

        // Save the privacy settings
        $this->privacyRepository->setMultiplePrivacy($user->id, $mappedSettings);

        // Get the updated settings to return
        $updatedSettings = $this->privacyRepository->getPrivacySettings($user->id);

        // Map back to frontend format
        $responseSettings = [];
        foreach ($updatedSettings as $fieldName => $setting) {
            $responseSettings[$fieldName] = match ($setting->visibility_level) {
                'public' => 'public',
                'connected_family' => 'connected',
                'only_me' => 'private',
                default => 'public',
            };
        }

        return response()->json([
            'success' => true,
            'message' => 'Field privacy settings updated successfully.',
            'field_privacy' => $responseSettings,
        ]);
    }

    /**
     * Get current field privacy settings for the authenticated user
     */
    public function getFieldPrivacy(): JsonResponse
    {
        $user = auth()->user();

        // Get the privacy settings from database
        $settings = $this->privacyRepository->getPrivacySettings($user->id);

        // If no settings exist, initialize with defaults
        if ($settings->isEmpty()) {
            $this->privacyRepository->initializeDefaults($user->id);
            $settings = $this->privacyRepository->getPrivacySettings($user->id);
        }

        // Allowed fields for field-level privacy (exclude full_name, profile_image_url, status)
        $allowedFields = ['email', 'phone', 'address', 'date_of_birth', 'gender', 'bio', 'job_title', 'education'];

        // Map to frontend format (public, connected, private)
        $fieldPrivacy = [];
        foreach ($settings as $fieldName => $setting) {
            // Only include allowed fields
            if (!in_array($fieldName, $allowedFields)) {
                continue;
            }

            $fieldPrivacy[$fieldName] = match ($setting->visibility_level) {
                'public' => 'public',
                'connected_family' => 'connected',
                'only_me' => 'private',
                default => 'public',
            };
        }

        return response()->json([
            'success' => true,
            'field_privacy' => $fieldPrivacy,
        ]);
    }

    /**
     * Get current content privacy settings (stories and galleries)
     */
    public function getContentPrivacy(): JsonResponse
    {
        $user = auth()->user();

        // Get or initialize content privacy settings
        $storiesVisibility = $user->stories_visibility ?? 'connected';
        $galleriesVisibility = $user->galleries_visibility ?? 'connected';

        return response()->json([
            'success' => true,
            'content_privacy' => [
                'stories' => $storiesVisibility,
                'galleries' => $galleriesVisibility,
            ],
        ]);
    }

    /**
     * Update content privacy settings (stories and galleries)
     */
    public function updateContentPrivacy(\Illuminate\Http\Request $request): JsonResponse
    {
        $user = auth()->user();
        $validated = $request->validate([
            'content_privacy' => 'required|array',
            'content_privacy.stories' => 'required|in:public,connected,private',
            'content_privacy.galleries' => 'required|in:public,connected,private',
        ]);

        // Update the content visibility settings
        $user->update([
            'stories_visibility' => $validated['content_privacy']['stories'],
            'galleries_visibility' => $validated['content_privacy']['galleries'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Content privacy settings updated successfully.',
            'content_privacy' => [
                'stories' => $user->stories_visibility,
                'galleries' => $user->galleries_visibility,
            ],
        ]);
    }
}
