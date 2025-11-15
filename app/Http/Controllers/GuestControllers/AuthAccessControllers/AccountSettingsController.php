<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangePasswordRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangeEmailRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\DeleteAccountRequest;
use App\Actions\GuestServices\AuthAccessServices\AccountService;
use Illuminate\Support\Facades\Auth;

class AccountSettingsController extends Controller
{
    public function __construct(
        private AccountService $accountService,
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
}
