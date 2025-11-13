<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\LoginRequest;
use App\Http\Requests\GuestRequests\RegisterRequest;
use App\Actions\GuestServices\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
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

            return redirect()->route('home')->with('success', 'Account created successfully!');
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

            // Log user in with remember me option
            Auth::guard('web')->login($user, $validated['rememberMe'] ?? false);

            return redirect()->route('home')->with('success', 'Login successful!');
        } catch (\Exception $e) {
            return redirect()->back()->withInput()->with('error', $e->getMessage());
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
