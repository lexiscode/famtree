<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function __construct(private AuthService $authService)
    {
    }

    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'firstName' => 'required|string|min:2',
                'lastName' => 'required|string|min:2',
                'username' => 'required|string|min:3|unique:users',
                'email' => 'required|email|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $user = $this->authService->register($validated);

            return response()->json([
                'success' => true,
                'message' => 'Account created successfully. Please log in.',
                'user' => $this->authService->getUserData($user),
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'emailOrUsername' => 'required|string',
                'password' => 'required|string',
                'rememberMe' => 'boolean',
            ]);

            $user = $this->authService->login(
                $validated['emailOrUsername'],
                $validated['password']
            );

            // Create API token for stateless authentication
            $token = $user->createToken('api-token')->plainTextToken;

            // Log user in for session-based auth
            Auth::guard('web')->login($user, $validated['rememberMe'] ?? false);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'user' => $this->authService->getUserData($user),
                'token' => $token,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed: ' . $e->getMessage(),
            ], 401);
        }
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        try {
            // Revoke all tokens
            if (auth()->user()) {
                auth()->user()->tokens()->delete();
            }

            // Logout from session
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully',
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get current authenticated user
     */
    public function user(): JsonResponse
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Not authenticated',
            ], 401);
        }

        $user = Auth::user();

        return response()->json([
            'success' => true,
            'user' => $this->authService->getUserData($user),
        ], 200);
    }
}
