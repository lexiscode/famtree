<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\SuggestedConnectionService;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ListSuggestedConnectionsRequest;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuggestedConnectionController extends Controller
{
    public function __construct(
        private SuggestedConnectionService $suggestedConnectionService,
        private UserConnectionRepository $connectionRepository
    ) {
    }

    /**
     * Show suggested connections page
     */
    public function index(Request $request)
    {
        $user = $request->user()->load('familyInfo');
        $userId = $user->id;

        // Get user profile data for sidebar
        $userProfile = [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'status' => $user->status ?? 'Alive',
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'profile_image_url' => $user->profile_image_url,
            'created_at' => $user->created_at,
        ];

        // Get suggestion count
        $suggestedCount = $this->suggestedConnectionService->getSuggestedMembersCount($userId);
        $availableRelationshipTypes = $this->suggestedConnectionService->getAvailableRelationshipTypes($userId);

        // Get connection counts
        $connectionCount = $this->connectionRepository->getConnectionCount($userId);
        $pendingRequestCount = $this->connectionRepository->getPendingRequestCount($userId);
        $sentRequestCount = $this->connectionRepository->getSentRequestCount($userId);

        // Fetch initial suggestions for the page (first 10)
        $initialSuggestions = $this->suggestedConnectionService->getSuggestedMembers($userId, null, 1, 10);

        // Get active spouses for "Other Parent" dropdown
        $spouses = $this->getActiveSpouses($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/SuggestedMembers', [
            'user' => $userProfile,
            'initial_suggestions' => $initialSuggestions['suggestions'],
            'total_suggestions' => $suggestedCount,
            'available_relationship_types' => $availableRelationshipTypes,
            'spouses' => $spouses,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'initial_page' => 1,
            'per_page' => 10,
        ]);
    }

    /**
     * Get paginated list of suggested connections (API endpoint)
     */
    public function list(ListSuggestedConnectionsRequest $request)
    {
        $userId = $request->user()->id;
        $page = $request->input('page', 1);
        $perPage = $request->input('per_page', 20);
        $relationshipFilter = $request->input('relationship_type');
        $searchQuery = $request->input('search');

        try {
            // Get suggestions
            if ($searchQuery) {
                $result = $this->suggestedConnectionService->searchSuggestedMembers(
                    $userId,
                    $searchQuery,
                    $relationshipFilter,
                    $page,
                    $perPage
                );
            } else {
                $result = $this->suggestedConnectionService->getSuggestedMembers(
                    $userId,
                    $relationshipFilter,
                    $page,
                    $perPage
                );
            }

            return response()->json([
                'success' => true,
                'data' => $result['suggestions'],
                'pagination' => [
                    'total' => $result['total'],
                    'per_page' => $result['per_page'],
                    'current_page' => $result['current_page'],
                    'last_page' => $result['last_page'],
                    'from' => $result['from'],
                    'to' => $result['to'],
                ],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get available relationship types for filtering
     */
    public function relationshipTypes(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $types = $this->suggestedConnectionService->getAvailableRelationshipTypes($userId);

            return response()->json([
                'success' => true,
                'types' => $types,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get suggestions count
     */
    public function count(Request $request)
    {
        $userId = $request->user()->id;

        try {
            $count = $this->suggestedConnectionService->getSuggestedMembersCount($userId);

            return response()->json([
                'success' => true,
                'count' => $count,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get active (non-divorced) spouses for the user
     */
    private function getActiveSpouses(int $userId): array
    {
        $connections = $this->connectionRepository->getConnections($userId);
        $spouses = [];

        foreach ($connections as $connection) {
            if (!in_array($connection->relationship_type, ['wife', 'husband', 'partner'])) {
                continue;
            }
            if ($connection->isDivorced()) {
                continue;
            }

            $spouse = $connection->requester_user_id === $userId
                ? $connection->recipient
                : $connection->requester;

            $spouses[] = [
                'id' => $spouse->id,
                'name' => trim($spouse->first_name . ' ' . $spouse->last_name),
                'profile_image_url' => $spouse->profile_image_url,
            ];
        }

        return $spouses;
    }
}
