<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\StatusService;
use Illuminate\Http\Request;

class StatusController extends Controller
{
    public function __construct(
        private StatusService $statusService,
    ) {}

    /**
     * Update user status (Alive/Deceased)
     */
    public function updateStatus(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the user ID from request (could be current user or nuclear family member)
        $userId = $request->input('user_id', $user->id);

        // Validate input
        $validated = $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'status' => 'required|string|in:alive,deceased',
            'death_date' => 'nullable|date|before_or_equal:today',
        ]);

        try {
            $result = $this->statusService->updateStatus(
                $userId,
                $user->id,
                $validated['status'],
                $validated['death_date'] ?? null
            );

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Get user status information
     */
    public function getStatus($userId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $status = $this->statusService->getUserStatus($userId);
            return response()->json($status);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'User not found',
            ], 404);
        }
    }

    /**
     * Check if user can update another user's status
     */
    public function canUpdateStatus(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $targetUserId = $request->input('user_id', $user->id);

        // Check if they are the same user
        if ($targetUserId === $user->id) {
            return response()->json([
                'can_update' => true,
                'reason' => 'own_account',
            ]);
        }

        // For now, return false (the full check would require additional logic)
        // The service will handle the detailed nuclear family check
        return response()->json([
            'can_update' => false,
            'reason' => 'not_authorized',
        ]);
    }
}
