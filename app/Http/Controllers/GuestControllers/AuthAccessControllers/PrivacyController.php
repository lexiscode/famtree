<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\UpdateProfileVisibilityRequest;
use Illuminate\Http\JsonResponse;

class PrivacyController extends Controller
{
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
}
