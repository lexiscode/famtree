<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\UserConnectionService;
use App\Actions\GuestServices\AuthAccessServices\UserBlockService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConnectionRequestController extends Controller
{
    public function __construct(
        private UserConnectionService $connectionService,
        private UserConnectionRepository $connectionRepository,
        private UserBlockService $blockService
    ) {
    }

    /**
     * Show all accepted connections
     */
    public function index(Request $request)
    {
        $user = $request->user()->load('familyInfo');
        $userId = $user->id;
        $relationshipFilter = $request->query('relationship_type');

        $connectionsData = $this->connectionService->getConnections($userId, $relationshipFilter);
        $connectionCount = $this->connectionRepository->getConnectionCount($userId);

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

        $pendingRequestCount = $this->connectionRepository->getPendingRequestCount($userId);
        $sentRequestCount = $this->connectionRepository->getSentRequestCount($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/MyConnections', [
            'user' => $userProfile,
            'connections' => $connectionsData['connections'],
            'total_count' => $connectionCount,
            'relationship_filter' => $relationshipFilter,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0, // TODO: Implement notification count
        ]);
    }

    /**
     * Show pending requests received
     */
    public function pending(Request $request)
    {
        $user = $request->user()->load('familyInfo');
        $userId = $user->id;

        $requestsData = $this->connectionService->getPendingRequests($userId);

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

        $connectionCount = $this->connectionRepository->getConnectionCount($userId);
        $pendingRequestCount = $this->connectionRepository->getPendingRequestCount($userId);
        $sentRequestCount = $this->connectionRepository->getSentRequestCount($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/PendingRequests', [
            'user' => $userProfile,
            'requests' => $requestsData['requests'],
            'count' => $requestsData['count'],
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0, // TODO: Implement notification count
        ]);
    }

    /**
     * Show sent requests
     */
    public function sent(Request $request)
    {
        $user = $request->user()->load('familyInfo');
        $userId = $user->id;

        $requestsData = $this->connectionService->getSentRequests($userId);

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

        $connectionCount = $this->connectionRepository->getConnectionCount($userId);
        $pendingRequestCount = $this->connectionRepository->getPendingRequestCount($userId);
        $sentRequestCount = $this->connectionRepository->getSentRequestCount($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/RequestSent', [
            'user' => $userProfile,
            'requests' => $requestsData['requests'],
            'count' => $requestsData['count'],
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0, // TODO: Implement notification count
        ]);
    }

    /**
     * Show send request form
     */
    public function create(Request $request)
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

        $connectionCount = $this->connectionRepository->getConnectionCount($userId);
        $pendingRequestCount = $this->connectionRepository->getPendingRequestCount($userId);
        $sentRequestCount = $this->connectionRepository->getSentRequestCount($userId);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/SendRequest', [
            'user' => $userProfile,
            'current_user_id' => $userId,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0, // TODO: Implement notification count
        ]);
    }

    /**
     * Send a connection request (API)
     */
    public function store(Request $request)
    {
        $userId = $request->user()->id;
        $user = $request->user();

        // Check if user has a phone number
        if (empty($user->phone)) {
            return response()->json([
                'success' => false,
                'error' => 'You must add your phone number before sending connection requests. Please update your profile in settings.',
                'redirect_url' => route('settings.account'),
            ], 403);
        }

        $validated = $request->validate([
            'recipient_id' => 'required|integer|exists:users,id',
            'relationship_type' => 'required|string',
        ]);

        try {
            $recipientId = $validated['recipient_id'];

            // Check if requester has blocked the recipient
            if ($this->blockService->hasBlocked($user, $recipientId)) {
                return response()->json([
                    'success' => false,
                    'error' => 'You have blocked this user and cannot send them a connection request.',
                ], 403);
            }

            // Check if recipient has blocked the requester
            if ($this->blockService->isBlockedBy($user, $recipientId)) {
                return response()->json([
                    'success' => false,
                    'error' => 'This user has blocked you. You cannot send them a connection request.',
                ], 403);
            }

            $result = $this->connectionService->sendConnectionRequest(
                $userId,
                $recipientId,
                $validated['relationship_type']
            );

            return response()->json($result, 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Accept a connection request (API)
     */
    public function accept(Request $request, int $connectionId)
    {
        $userId = $request->user()->id;
        $user = $request->user();

        // Check if user has a phone number
        if (empty($user->phone)) {
            return response()->json([
                'success' => false,
                'error' => 'You must add your phone number before accepting connection requests. Please update your profile in settings.',
                'redirect_url' => route('settings.account'),
            ], 403);
        }

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
     * Search for users to send connection to
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
              ->orWhere('email', 'like', '%' . $query . '%')
              ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", ['%' . $query . '%']);
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
     * Get relationship types
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
