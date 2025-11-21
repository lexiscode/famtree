<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\LoginRequest;
use App\Http\Requests\GuestRequests\RegisterRequest;
use App\Http\Requests\GuestRequests\AuthAccessRequests\VerifyTwoFARequest;
use App\Actions\GuestServices\AuthService;
use App\Actions\GuestServices\AuthAccessServices\AccountService;
use App\Actions\GuestServices\AuthAccessServices\TwoFactorAuthService;
use App\Actions\GuestServices\OnboardingService;
use App\Models\GuestModels\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthController extends Controller
{
    public function __construct(
        private AuthService $authService,
        private OnboardingService $onboardingService,
        private AccountService $accountService,
        private TwoFactorAuthService $twoFactorService
    ) {
    }

    /**
     * Handle user registration
     */
    public function register(RegisterRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $user = $this->authService->register($validated);

            // Log the user in after registration
            Auth::guard('web')->login($user);

            // Initialize onboarding steps for new user
            $this->onboardingService->initializeOnboarding($user->id);

            // Redirect to onboarding if not completed
            if (!$user->onboarding_completed) {
                return redirect()->route('onboarding.show')->with('success', 'Account created successfully! Let\'s get started with your profile.');
            }

            // Otherwise redirect to profile
            return redirect()->route('profile.me')->with('success', 'Account created successfully!');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Handle user login
     */
    public function login(LoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $user = $this->authService->login(
                $validated['emailOrUsername'],
                $validated['password']
            );

            // Check if user's account is soft deleted and restore it
            if ($user->trashed()) {
                $this->accountService->restoreAccount($user);
            }

            // Check if 2FA is enabled for this user
            if ($user->two_fa_enabled) {
                // Store the user ID in session for 2FA verification
                $request->session()->put('2fa_pending_user_id', $user->id);
                $request->session()->put('2fa_remember_me', $validated['rememberMe'] ?? false);

                // Redirect to 2FA verification page
                return redirect()->route('auth.2fa-verify')->with('info', 'Please enter your 2FA code to complete login.');
            }

            // Log user in with remember me option
            Auth::guard('web')->login($user, $validated['rememberMe'] ?? false);

            // Initialize onboarding steps if not already done (for users who didn't complete it)
            if (!$user->onboarding_completed) {
                $existingSteps = $user->onboardingSteps()->count();
                if ($existingSteps === 0) {
                    $this->onboardingService->initializeOnboarding($user->id);
                }
                return redirect()->route('onboarding.show')->with('success', 'Login successful! Let\'s complete your profile setup.');
            }

            // Otherwise redirect to profile
            return redirect()->route('profile.me')->with('success', 'Login successful!');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Show 2FA verification page
     */
    public function show2FAVerify(Request $request)
    {
        // Check if there's a pending 2FA verification
        if (!$request->session()->has('2fa_pending_user_id')) {
            return redirect()->route('home')->with('error', 'Invalid 2FA request.');
        }

        return Inertia::render('GuestPages/Auth/TwoFactorVerify');
    }

    /**
     * Verify 2FA code during login
     */
    public function verify2FA(VerifyTwoFARequest $request): RedirectResponse
    {
        // Check if there's a pending 2FA verification
        if (!$request->session()->has('2fa_pending_user_id')) {
            return redirect()->route('home')->with('error', 'Invalid 2FA request.');
        }

        $userId = $request->session()->get('2fa_pending_user_id');
        $rememberMe = $request->session()->get('2fa_remember_me', false);
        $validated = $request->validated();

        try {
            // Get the user
            $user = User::findOrFail($userId);

            // Verify the 2FA code (supports both TOTP and backup codes)
            if (!$this->twoFactorService->verifyForUser($user, $validated['code'])) {
                return redirect()->back()->with('error', 'Invalid 2FA code. Please try again.');
            }

            // Clear the 2FA session data
            $request->session()->forget(['2fa_pending_user_id', '2fa_remember_me']);

            // Log the user in
            Auth::guard('web')->login($user, $rememberMe);

            // Initialize onboarding steps if not already done
            if (!$user->onboarding_completed) {
                $existingSteps = $user->onboardingSteps()->count();
                if ($existingSteps === 0) {
                    $this->onboardingService->initializeOnboarding($user->id);
                }
                return redirect()->route('onboarding.show')->with('success', 'Login successful! Let\'s complete your profile setup.');
            }

            // Otherwise redirect to profile
            return redirect()->route('profile.me')->with('success', 'Login successful!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'An error occurred. Please try again.');
        }
    }

    /**
     * Handle user logout
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home')->with('success', 'Logged out successfully!');
    }
}
