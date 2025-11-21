<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\OnboardingService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function __construct(private OnboardingService $onboardingService)
    {
    }

    /**
     * Show the onboarding start page
     */
    public function show(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $onboardingData = $this->onboardingService->getOnboardingData($userId);
            $progress = $this->onboardingService->getProgress($userId);

            return Inertia::render('GuestPages/Onboarding/Index', [
                'onboarding' => $onboardingData,
                'progress' => $progress,
            ]);
        } catch (\Exception $e) {
            return Inertia::render('GuestPages/Onboarding/Index', [
                'error' => 'Unable to load onboarding data',
            ]);
        }
    }

    /**
     * Save basic info step
     */
    public function saveBasicInfo(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'phone' => 'nullable|string|max:20',
                'bio' => 'nullable|string|max:500',
                'date_of_birth' => 'nullable|date',
                'gender' => 'nullable|in:male,female',
            ]);

            $progress = $this->onboardingService->saveBasicInfoStep($userId, $validated);

            return back()->with([
                'success' => 'Basic information saved successfully',
                'progress' => $progress,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Save family status step
     */
    public function saveFamilyStatus(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'family_status' => 'required|in:single,dating,married,divorced,widowed,prefer_not_to_say',
                'number_of_siblings' => 'nullable|integer|min:0',
                'number_of_children' => 'nullable|integer|min:0',
            ]);

            $progress = $this->onboardingService->saveFamilyStatusStep($userId, $validated);

            return back()->with([
                'success' => 'Family status saved successfully',
            ])->with('progress', $progress);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Save profile image step
     */
    public function saveProfileImage(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'profile_image' => 'nullable|image|mimes:jpeg,png,gif,webp|max:5120',
            ]);

            $profileImagePath = null;

            // Handle file upload
            if ($request->hasFile('profile_image')) {
                $file = $request->file('profile_image');
                $profileImagePath = $file->store('profile-images/' . $userId, 'public');
            }

            $progress = $this->onboardingService->saveProfileImageStep($userId, $profileImagePath);

            return back()->with([
                'success' => 'Profile image saved successfully',
            ])->with('progress', $progress);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Save location info step
     */
    public function saveLocationInfo(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'address' => 'nullable|string|max:500',
                'city' => 'nullable|string|max:255',
                'state_province' => 'nullable|string|max:255',
                'country' => 'required|string|max:255',
            ]);

            $progress = $this->onboardingService->saveLocationInfoStep($userId, $validated);

            return back()->with([
                'success' => 'Location information saved successfully',
                'progress' => $progress,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Save education and work step
     */
    public function saveEducationWork(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'education_level' => 'nullable|string|max:255',
                'current_occupation' => 'nullable|string|max:255',
            ]);

            $progress = $this->onboardingService->saveEducationWorkStep($userId, $validated);

            return back()->with([
                'success' => 'Education and work information saved successfully',
                'progress' => $progress,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Save siblings search step
     */
    public function saveSiblingsSearch(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $validated = $request->validate([
                'searched' => 'boolean',
            ]);

            $progress = $this->onboardingService->saveSiblingsSearchStep($userId, $validated);

            return back()->with([
                'success' => 'Siblings search preference saved successfully',
                'progress' => $progress,
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Complete onboarding
     */
    public function complete(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $progress = $this->onboardingService->completeOnboarding($userId);

            return back()->with([
                'success' => 'Onboarding completed successfully',
                'progress' => $progress,
            ]);
        } catch (\Exception $e) {
            return back()->with([
                'error' => 'Failed to complete onboarding',
            ], 500);
        }
    }
}
