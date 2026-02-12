<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Repositories\GuestRepositories\SearchRepository;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SearchController extends Controller
{
    public function __construct(private SearchRepository $searchRepository) {}

    /**
     * Search users by query
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => 'required|string|min:1|max:100',
            'limit' => 'sometimes|integer|min:1|max:100',
        ]);

        $query = $validated['q'];
        $limit = $validated['limit'] ?? 20;
        $currentUserId = auth()->id();

        try {
            $users = $this->searchRepository->searchUsers($query, $limit, $currentUserId);

            $results = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => trim($user->first_name . ' ' . $user->last_name),
                    'username' => $user->username,
                    'email' => $user->email,
                    'profile_image_url' => $user->profile_image_url,
                    'bio' => $user->bio ?? '',
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $results,
                'count' => count($results),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get featured/suggested users
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getFeatured(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $currentUserId = auth()->id();

        try {
            $featured = $this->searchRepository->getFeaturedUsers($limit);

            $results = $featured->map(function ($user) use ($currentUserId) {
                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'username' => $user->username,
                    'profile_image_url' => $user->profile_image_url,
                    'bio' => $user->bio ?? '',
                    'total_connections' => ($user->connections_as_requester_count ?? 0) +
                                          ($user->connections_as_recipient_count ?? 0),
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch featured users: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get suggested users to connect with
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function getSuggested(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 5);
        $currentUserId = auth()->id();

        try {
            $suggested = $this->searchRepository->getSuggestedUsers($currentUserId, $limit);

            $results = $suggested->map(function ($user) use ($currentUserId) {
                $connectionStatus = $this->searchRepository->getConnectionStatus(
                    $currentUserId,
                    $user->id
                );

                return [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'username' => $user->username,
                    'profile_image_url' => $user->profile_image_url,
                    'bio' => $user->bio ?? '',
                    'connection_status' => $connectionStatus,
                    'reason' => 'Connected to someone you know',
                ];
            })->toArray();

            return response()->json([
                'success' => true,
                'data' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch suggestions: ' . $e->getMessage(),
            ], 500);
        }
    }
}
