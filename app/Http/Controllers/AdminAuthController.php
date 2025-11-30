<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\AdminModels\Admin;
use App\Models\AdminActivityLog;

class AdminAuthController extends Controller
{
    /**
     * Show admin login page
     */
    public function showLogin()
    {
        return Inertia::render('AdminPages/Auth/AdminLogin');
    }

    /**
     * Handle admin login
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        if (Auth::guard('admin')->attempt($credentials, $remember)) {
            $admin = Auth::guard('admin')->user();

            // Update last login time
            $admin->update(['last_login_at' => now()]);

            // Log activity
            AdminActivityLog::create([
                'admin_id' => $admin->id,
                'action_type' => 'login',
                'description' => 'Admin logged in',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $request->session()->regenerate();

            return redirect()->intended(route('admin.dashboard'))
                ->with('success', 'Welcome back, ' . $admin->username . '!');
        }

        // Log failed login attempt
        AdminActivityLog::create([
            'admin_id' => null,
            'action_type' => 'failed_login',
            'description' => 'Failed login attempt for: ' . $credentials['email'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    /**
     * Handle admin logout
     */
    public function logout(Request $request)
    {
        $admin = Auth::guard('admin')->user();

        if ($admin) {
            // Log activity
            AdminActivityLog::create([
                'admin_id' => $admin->id,
                'action_type' => 'logout',
                'description' => 'Admin logged out',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/admin/login')->with('success', 'You have been logged out.');
    }

    /**
     * Show forgot password form
     */
    public function showForgotPassword()
    {
        return Inertia::render('AdminPages/Auth/AdminForgotPassword');
    }

    /**
     * Handle forgot password request
     */
    public function forgotPassword(Request $request)
    {
        // TODO: Implement password reset functionality
        return back()->with('success', 'Password reset link sent to your email.');
    }

    /**
     * Show reset password form
     */
    public function showResetPassword(Request $request)
    {
        return Inertia::render('AdminPages/Auth/AdminResetPassword');
    }

    /**
     * Handle reset password
     */
    public function resetPassword(Request $request)
    {
        // TODO: Implement password reset functionality
        return redirect()->route('admin.login')->with('success', 'Password has been reset.');
    }
}
