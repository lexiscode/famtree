<?php

namespace App\Http\Controllers\GuestControllers;

use App\Actions\GuestServices\MemorialEmailService;
use App\Actions\GuestServices\MemorialService;
use App\Http\Controllers\Controller;
use App\Models\GuestModels\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AccountReactivationController extends Controller
{
    public function __construct(
        protected MemorialService $memorialService,
        protected MemorialEmailService $emailService
    ) {}

    /**
     * Show the reactivation form.
     */
    public function showReactivationForm(string $token)
    {
        $user = $this->memorialService->validateReactivationToken($token);

        if (!$user) {
            return Inertia::render('GuestPages/AccountReactivation/Invalid', [
                'message' => 'This reactivation link is invalid or has expired.',
            ]);
        }

        return Inertia::render('GuestPages/AccountReactivation/Confirm', [
            'token' => $token,
            'user' => [
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
            ],
        ]);
    }

    /**
     * Confirm reactivation and restore the account.
     */
    public function confirmReactivation(string $token)
    {
        $user = $this->memorialService->validateReactivationToken($token);

        if (!$user) {
            return redirect()->route('home')->with('error', 'This reactivation link is invalid or has expired.');
        }

        // Reactivate the account
        $reactivatedUser = $this->memorialService->reactivateAccount($user);

        // Log the user in
        Auth::login($reactivatedUser);

        return redirect()->route('profile')->with('success', 'Welcome back! Your account has been reactivated.');
    }

    /**
     * Request a reactivation email (for memorialized users trying to log in).
     */
    public function requestReactivation(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->input('email'))
            ->where('is_memorial', true)
            ->first();

        if (!$user) {
            // Don't reveal if the email exists or not
            return back()->with('success', 'If an account with that email exists and is memorialized, a reactivation link will be sent.');
        }

        // Check rate limiting
        if (!$this->memorialService->canRequestReactivation($user)) {
            return back()->with('error', 'Please wait before requesting another reactivation email.');
        }

        // Generate token and send email
        $token = $this->memorialService->generateReactivationToken($user);
        $this->emailService->sendReactivationEmail($user, $token);

        return back()->with('success', 'If an account with that email exists and is memorialized, a reactivation link will be sent.');
    }
}
