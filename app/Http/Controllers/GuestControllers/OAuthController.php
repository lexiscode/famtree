<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\CompleteOAuthRequest;
use App\Actions\GuestServices\OAuthService;
use App\Actions\GuestServices\AuthAccessServices\AccountService;
use App\Actions\GuestServices\AuthAccessServices\TwoFactorAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Facades\Socialite;
use Inertia\Inertia;
use Inertia\Response;

class OAuthController extends Controller
{
    public function __construct(
        private OAuthService $oAuthService,
        private AccountService $accountService,
        private TwoFactorAuthService $twoFactorService
    ) {}

    /**
     * Redirect to Google OAuth consent screen
     */
    public function redirectToGoogle(): RedirectResponse
    {
        return Socialite::driver('google')
            ->stateless() // Stateless for better compatibility
            ->redirect();
    }

    /**
     * Handle Google OAuth callback
     */
    public function handleGoogleCallback(Request $request): RedirectResponse
    {
        try {
            // Get user data from Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Process OAuth callback
            $result = $this->oAuthService->processGoogleCallback($googleUser);

            if ($result['action'] === 'login') {
                // User exists or was just linked - log them in
                $user = $result['user'];

                // Check if user's account is soft deleted and restore it
                if ($user->trashed()) {
                    $this->accountService->restoreAccount($user);
                }

                // Check if 2FA is enabled for this user
                if ($user->two_fa_enabled) {
                    // Store the user ID in session for 2FA verification
                    $request->session()->put('2fa_pending_user_id', $user->id);
                    $request->session()->put('2fa_remember_me', false);

                    // Redirect to 2FA verification page
                    return redirect()->route('auth.2fa-verify')
                        ->with('info', 'Please enter your 2FA code to complete login.');
                }

                // Log user in
                Auth::guard('web')->login($user, false);

                return redirect()->route('home')
                    ->with('success', 'Successfully logged in with Google!');
            }

            // New user - redirect to completion form
            // Store OAuth data in session
            $request->session()->put('oauth_pending_data', $result['oauth_data']);

            return redirect()->route('auth.oauth.complete');

        } catch (\Exception $e) {
            Log::error('Google OAuth error: ' . $e->getMessage());

            return redirect()->route('home')
                ->with('error', 'Failed to authenticate with Google. Please try again.');
        }
    }

    /**
     * Show OAuth completion form
     */
    public function showCompletionForm(Request $request): Response|RedirectResponse
    {
        $oAuthData = $request->session()->get('oauth_pending_data');

        // Validate OAuth session data
        if (!$this->oAuthService->validateOAuthSessionData($oAuthData)) {
            return redirect()->route('home')
                ->with('error', 'Invalid OAuth session. Please try logging in again.');
        }

        return Inertia::render('GuestPages/Auth/CompleteOAuth', [
            'oAuthData' => [
                'first_name' => $oAuthData['first_name'],
                'last_name' => $oAuthData['last_name'],
                'email' => $oAuthData['email'],
                'avatar' => $oAuthData['avatar'] ?? null,
            ],
        ]);
    }

    /**
     * Handle OAuth completion form submission
     */
    public function completeRegistration(CompleteOAuthRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $oAuthData = $request->session()->get('oauth_pending_data');

        try {
            // Create user with OAuth data + completion data
            $user = $this->oAuthService->completeOAuthRegistration(
                $oAuthData,
                $validated['gender'],
                $validated['password']
            );

            // Clear OAuth session data
            $request->session()->forget('oauth_pending_data');

            // Log the user in
            Auth::guard('web')->login($user);

            return redirect()->route('home')
                ->with('success', 'Account created successfully! Welcome to FamTree.');

        } catch (\Exception $e) {
            Log::error('OAuth registration completion error: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Failed to complete registration. Please try again.');
        }
    }
}
