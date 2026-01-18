<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangePasswordRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangeEmailRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\DeleteAccountRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\UpdateProfileRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\EnableTwoFARequest;
use App\Actions\GuestServices\AuthAccessServices\AccountService;
use App\Actions\GuestServices\AuthAccessServices\TwoFactorAuthService;
use Illuminate\Support\Facades\Auth;

class AccountSettingsController extends Controller
{
    public function __construct(
        private AccountService $accountService,
        private TwoFactorAuthService $twoFactorService,
    ) {}

    /**
     * Change the authenticated user's password
     */
    public function changePassword(ChangePasswordRequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        $this->accountService->changePassword($user, $validated['new']);

        return back()->with('success', 'Password changed successfully.');
    }

    /**
     * Change the authenticated user's email address
     */
    public function changeEmail(ChangeEmailRequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        $this->accountService->changeEmail($user, $validated['email']);

        return back()->with('success', 'Email address changed successfully.');
    }

    /**
     * Soft delete the user's account
     * Account will be permanently deleted after 30 days if not restored
     */
    public function deleteAccount(DeleteAccountRequest $request)
    {
        $user = auth()->user();

        $this->accountService->deleteAccount($user);

        Auth::logout();

        return redirect()->route('home')->with('success', 'Your account has been scheduled for deletion. You have 30 days to log back in to restore it.');
    }

    /**
     * Update the authenticated user's profile information
     */
    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        // Extract the file from the validated data
        $profileImage = $request->file('profile_image');

        // Remove the file from validated data before passing to service
        unset($validated['profile_image']);

        $this->accountService->updateProfile($user, $validated, $profileImage);

        return back()->with('success', 'Profile information updated successfully.');
    }

    /**
     * Update profile image only
     */
    public function updateProfileImage(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();

        $request->validate([
            'profile_image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        $profileImage = $request->file('profile_image');

        $this->accountService->updateProfileImage($user, $profileImage);

        return response()->json([
            'success' => true,
            'message' => 'Profile image updated successfully.',
            'profile_image_url' => $user->fresh()->profile_image_url,
        ]);
    }

    /**
     * Update a single profile field (PATCH)
     */
    public function updateSingleField(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();

        // Validate the field and value
        $allowedFields = ['phone', 'address', 'bio', 'date_of_birth', 'gender', 'job_title', 'education'];
        $field = $request->input('field');
        $value = $request->input('value');

        if (!in_array($field, $allowedFields)) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid field specified.',
            ], 422);
        }

        // Validate based on field type
        $rules = [
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:500',
            'date_of_birth' => 'nullable|date|before:today',
            'gender' => 'nullable|in:male,female,other',
            'job_title' => 'nullable|string|max:100',
            'education' => 'nullable|string|max:100',
        ];

        $validator = \Illuminate\Support\Facades\Validator::make(
            ['value' => $value],
            ['value' => $rules[$field]]
        );

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first('value'),
            ], 422);
        }

        // Update the field
        $this->accountService->updateSingleField($user, $field, $value);

        return response()->json([
            'success' => true,
            'message' => ucfirst(str_replace('_', ' ', $field)) . ' updated successfully.',
            'value' => $value,
        ]);
    }

    /**
     * Generate 2FA secret and QR code
     */
    public function generateTwoFA()
    {
        $user = auth()->user();
        $twoFAData = $this->twoFactorService->generateSecret($user);

        return response()->json([
            'success' => true,
            'secret' => $twoFAData['secret'],
            'qr_code_url' => $twoFAData['qr_code_url'],
        ]);
    }

    /**
     * Enable 2FA for the user
     */
    public function enableTwoFA(EnableTwoFARequest $request)
    {
        $user = auth()->user();
        $validated = $request->validated();

        if (!$this->twoFactorService->enable($user, $validated['secret'], $validated['code'])) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid verification code. Please try again.',
            ], 422);
        }

        $backupCodes = $this->twoFactorService->getBackupCodes($user);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication enabled successfully.',
            'backup_codes' => $backupCodes,
        ]);
    }

    /**
     * Disable 2FA for the user
     */
    public function disableTwoFA()
    {
        $user = auth()->user();
        $this->twoFactorService->disable($user);

        return response()->json([
            'success' => true,
            'message' => 'Two-factor authentication disabled successfully.',
        ]);
    }

    /**
     * Get 2FA status
     */
    public function getTwoFAStatus()
    {
        $user = auth()->user();
        $isEnabled = $this->twoFactorService->isEnabled($user);
        $backupCodesCount = count($this->twoFactorService->getBackupCodes($user));

        return response()->json([
            'success' => true,
            'enabled' => $isEnabled,
            'backup_codes_count' => $backupCodesCount,
        ]);
    }
}
