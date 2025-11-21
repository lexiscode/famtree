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
