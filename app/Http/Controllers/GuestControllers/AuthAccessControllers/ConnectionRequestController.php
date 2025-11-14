<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\UserConnectionService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConnectionRequestController extends Controller
{
    public function __construct(
        private UserConnectionService $connectionService,
        private UserConnectionRepository $connectionRepository
    ) {
    }

    /**
     * Show all accepted connections
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $relationshipFilter = $request->query('relationship_type');

        $connectionsData = $this->connectionService->getConnections($userId, $relationshipFilter);
        $connectionCount = $this->connectionRepository->getConnectionCount($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/MyConnections', [
            'connections' => $connectionsData['connections'],
            'total_count' => $connectionCount,
            'relationship_filter' => $relationshipFilter,
        ]);
    }

    /**
     * Show pending requests received
     */
    public function pending(Request $request)
    {
        $userId = $request->user()->id;

        $requestsData = $this->connectionService->getPendingRequests($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/PendingRequests', [
            'requests' => $requestsData['requests'],
            'count' => $requestsData['count'],
        ]);
    }

    /**
     * Show sent requests
     */
    public function sent(Request $request)
    {
        $userId = $request->user()->id;

        $requestsData = $this->connectionService->getSentRequests($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/RequestSent', [
            'requests' => $requestsData['requests'],
            'count' => $requestsData['count'],
        ]);
    }

    /**
     * Show send request form
     */
    public function create(Request $request)
    {
        $userId = $request->user()->id;

        return Inertia::render('GuestPages/AuthAccessPages/Connections/SendRequest', [
            'current_user_id' => $userId,
        ]);
    }

    /**
     * Send a connection request (API)
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;

        $validated = $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'relationship_type' => 'required|string',
        ]);

        try {
            $result = $this->connectionService->sendConnectionRequest(
                $userId,
                $validated['recipient_id'],
                $validated['relationship_type']
            );

            return response()->json($result, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Accept a connection request (API)
     */
    public function accept(Request $request, int $connectionId)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->connectionService->acceptConnection($connectionId, $userId);

            return response()->json($result, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Decline a connection request (API)
     */
    public function decline(Request $request, int $connectionId)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->connectionService->declineConnection($connectionId, $userId);

            return response()->json($result, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Unsend a pending request (API)
     */
    public function undoRequest(Request $request, int $connectionId)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->connectionService->undoRequest($connectionId, $userId);

            return response()->json($result, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Undo a connection acceptance (API)
     */
    public function undoAcceptance(Request $request, int $connectionId)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->connectionService->undoConnection($connectionId, $userId);

            return response()->json($result, 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Search for users to send connection to (API)
     */
    public function searchUsers(Request $request)
    {
        $validated = $request->validate([
            'query' => 'required|string|min:2',
            'limit' => 'nullable|integer|min:1|max:50',
        ]);

        $userId = $request->user()->id;
        $limit = $validated['limit'] ?? 20;
        $query = $validated['query'];

        $users = \App\Models\GuestModels\User::where(function ($q) use ($query) {
            $q->where('first_name', 'like', '%' . $query . '%')
              ->orWhere('last_name', 'like', '%' . $query . '%')
              ->orWhere('username', 'like', '%' . $query . '%')
              ->orWhere('email', 'like', '%' . $query . '%');
        })
        ->where('id', '!=', $userId)
        ->limit($limit)
        ->get()
        ->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->first_name . ' ' . $user->last_name,
                'username' => $user->username,
                'email' => $user->email,
                'profile_image_url' => $user->profile_image_url,
            ];
        });

        return response()->json([
            'users' => $users,
            'count' => $users->count(),
        ]);
    }

    /**
     * Get relationship types (API)
     */
    public function relationshipTypes()
    {
        $types = \App\Models\GuestModels\RelationshipType::orderBy('sort_order')->get()->map(function ($type) {
            return [
                'key' => $type->type_key,
                'label' => $type->label,
                'description' => $type->description,
            ];
        });

        return response()->json([
            'types' => $types,
        ]);
    }
}
