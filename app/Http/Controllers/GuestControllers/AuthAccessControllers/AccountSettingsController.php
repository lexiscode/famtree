<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangePasswordRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ChangeEmailRequest;
use App\Actions\GuestServices\AuthAccessServices\AccountService;

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
}
