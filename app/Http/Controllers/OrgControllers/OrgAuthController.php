<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Models\OrgModels\OrgAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use App\Models\OrgModels\OrgActivityLog;

class OrgAuthController extends Controller
{
    public function showLogin()
    {
        return Inertia::render('OrgPages/Auth/OrgLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
            'remember' => 'boolean',
        ]);

        $remember = $credentials['remember'] ?? false;
        unset($credentials['remember']);

        if (Auth::guard('org')->attempt($credentials, $remember)) {
            $orgAccount = Auth::guard('org')->user();

            $orgAccount->update(['last_login_at' => now()]);

            OrgActivityLog::create([
                'org_account_id' => $orgAccount->id,
                'organization_id' => $orgAccount->organization_id,
                'action_type' => 'login',
                'description' => 'Organization account logged in',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);

            $request->session()->regenerate();

            return redirect()->intended(route('org.dashboard'))
                ->with('success', 'Welcome back, ' . ($orgAccount->display_name ?? $orgAccount->username) . '!');
        }

        OrgActivityLog::create([
            'org_account_id' => null,
            'organization_id' => null,
            'action_type' => 'failed_login',
            'description' => 'Failed org login attempt for: ' . $credentials['email'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function showForgotPassword()
    {
        return Inertia::render('OrgPages/Auth/OrgForgotPassword');
    }

    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $account = OrgAccount::where('email', $request->email)->first();

        if (!$account) {
            return redirect()->back()->with('error', 'No organization account found with this email address.');
        }

        $broker = Password::broker('org_accounts');
        $response = $broker->sendResetLink(['email' => $request->email]);

        if ($response !== Password::RESET_LINK_SENT) {
            return redirect()->back()->with('error', 'Failed to send password reset link. Please try again.');
        }

        return redirect()->back()->with('success', 'Password reset link sent to your email address.');
    }

    public function showResetPassword(Request $request)
    {
        return Inertia::render('OrgPages/Auth/OrgResetPassword', [
            'token' => $request->query('token'),
            'email' => $request->query('email'),
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $broker = Password::broker('org_accounts');

        $response = $broker->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (OrgAccount $account, string $password) {
                $account->password = Hash::make($password);
                $account->save();
            }
        );

        if ($response !== Password::PASSWORD_RESET) {
            return redirect()->back()->with('error', 'Failed to reset password. The reset link may have expired.');
        }

        // Auto-login after reset
        $account = OrgAccount::where('email', $request->email)->first();
        Auth::guard('org')->login($account);
        $request->session()->regenerate();

        return redirect()->route('org.dashboard')->with('success', 'Password reset successfully! You are now logged in.');
    }

    public function logout(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        if ($orgAccount) {
            OrgActivityLog::create([
                'org_account_id' => $orgAccount->id,
                'organization_id' => $orgAccount->organization_id,
                'action_type' => 'logout',
                'description' => 'Organization account logged out',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        }

        Auth::guard('org')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/org/login')->with('success', 'You have been logged out.');
    }
}
