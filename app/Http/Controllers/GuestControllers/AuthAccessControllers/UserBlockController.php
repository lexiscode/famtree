<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\BlockUserRequest;
use App\Actions\GuestServices\AuthAccessServices\UserBlockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserBlockController extends Controller
{
    public function __construct(
        private UserBlockService $blockService,
    ) {}

    /**
     * Block a user
     */
    public function store(BlockUserRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validated();

            $result = $this->blockService->blockUser($user, $validated['username']);

            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Unblock a user
     */
    public function destroy(Request $request, int $blockedUserId): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $result = $this->blockService->unblockUser($user, $blockedUserId);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get user's blocked users list
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $blockedUsers = $this->blockService->getBlockedUsers($user);

            return response()->json([
                'success' => true,
                'blocked_users' => $blockedUsers,
                'count' => count($blockedUsers),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
