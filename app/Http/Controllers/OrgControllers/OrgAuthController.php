<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
