<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminRequests\AdminLoginRequest;
use App\Http\Requests\AdminRequests\AdminForgotPasswordRequest;
use App\Http\Requests\AdminRequests\AdminResetPasswordRequest;
use App\Actions\AdminServices\AdminAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AdminAuthController extends Controller
{
    public function __construct(private AdminAuthService $authService)
    {
    }

    /**
     * Show admin login page
     */
    public function showLogin(): Response
    {
        return Inertia::render('AdminPages/Auth/AdminLogin');
    }

    /**
     * Handle admin login
     */
    public function login(AdminLoginRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            // Authenticate admin
            $admin = $this->authService->login($validated['email'], $validated['password']);

            // Log admin in with remember me option
            Auth::guard('admin')->login($admin, $validated['rememberMe'] ?? false);

            // Update last login timestamp
            $this->authService->updateLastLogin($admin);

            return redirect()->route('admin.dashboard')->with('success', 'Login successful! Welcome to the admin panel.');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
        }
    }

    /**
     * Show forgot password page
     */
    public function showForgotPassword(): Response
    {
        return Inertia::render('AdminPages/Auth/AdminForgotPassword');
    }

    /**
     * Handle forgot password request
     */
    public function forgotPassword(AdminForgotPasswordRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $this->authService->sendPasswordResetLink($validated['email']);

            return redirect()->back()->with('success', 'Password reset link sent to your email address.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Show reset password page
     */
    public function showResetPassword(Request $request): Response
    {
        return Inertia::render('AdminPages/Auth/AdminResetPassword', [
            'token' => $request->query('token'),
            'email' => $request->query('email'),
        ]);
    }

    /**
     * Handle password reset
     */
    public function resetPassword(AdminResetPasswordRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        try {
            $admin = $this->authService->resetPassword($validated);

            // Auto-login the admin after password reset
            Auth::guard('admin')->login($admin);

            return redirect()->route('admin.dashboard')->with('success', 'Password reset successfully! You are now logged in.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }

    /**
     * Handle admin logout
     */
    public function logout(Request $request): RedirectResponse
    {
        $this->authService->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('admin.login')->with('success', 'Logged out successfully!');
    }
}
