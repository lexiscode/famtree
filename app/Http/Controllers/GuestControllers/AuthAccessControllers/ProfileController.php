<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Actions\GuestServices\UserConnectionService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private ProfilePrivacyService $privacyService,
        private UserConnectionService $connectionService,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Display the current user's profile
     */
    public function myProfile()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Get all user connections
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);

        // Get pending requests
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);

        // Format user data
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'created_at' => $user->created_at,
        ];

        return Inertia::render('GuestPages/AuthAccessPages/Profile/MyProfile', [
            'user' => $userData,
            'connections' => $connections,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
        ]);
    }

    /**
     * View another user's profile (with privacy filtering)
     */
    public function viewProfile(int $userId)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return redirect()->route('login');
        }

        $owner = User::findOrFail($userId);

        // Get visible profile data based on privacy settings
        $visibleData = $this->privacyService->getFormattedProfileData($viewer->id, $owner->id);

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $owner->id);

        // Check if they are connected and get relationship type
        $connectionStatus = null;
        $relationshipType = null;

        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $types = $this->connectionRepository->getConnectionType($viewer->id, $owner->id);
            if ($types) {
                $connectionStatus = 'connected';
                $relationshipType = $types[0] ?? null;
            }
        }

        // Check for pending/sent requests
        $pendingRequest = null;
        $sentRequest = null;

        if ($connectionStatus !== 'connected') {
            $pendingRequest = $this->connectionRepository->getPendingRequestBetween($viewer->id, $owner->id);
            $sentRequest = $this->connectionRepository->getSentRequestBetween($viewer->id, $owner->id);
        }

        // Get mutual connections
        $mutualConnections = [];
        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $owner->id);
        }

        // Format profile data for frontend
        $profileData = [
            'id' => $owner->id,
            'name' => $visibleData['full_name']['value'] ?? null,
            'username' => $owner->username,
            'email' => $relationshipContext === 'nuclear_family' ? $owner->email : null,
            'phone' => $visibleData['phone']['value'],
            'address' => $visibleData['address']['value'],
            'bio' => $visibleData['bio']['value'],
            'date_of_birth' => $visibleData['date_of_birth']['value'],
            'profile_image_url' => $visibleData['profile_image_url']['value'],
            'status' => $visibleData['status']['value'],
            'job_title' => $visibleData['job_title']['value'] ?? null,
            'education' => $visibleData['education']['value'] ?? null,
            'created_at' => $owner->created_at,
        ];

        // Format visible fields info
        $visibleFields = [];
        foreach ($visibleData as $fieldName => $fieldData) {
            $visibleFields[$fieldName] = [
                'visible' => $fieldData['visible'],
                'label' => $fieldData['label'],
            ];
        }

        return Inertia::render('GuestPages/AuthAccessPages/Profile/ViewProfile', [
            'profile' => $profileData,
            'visibleFields' => $visibleFields,
            'relationshipContext' => $relationshipContext,
            'connectionStatus' => $connectionStatus,
            'relationshipType' => $relationshipType,
            'pendingRequest' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'status' => $pendingRequest->status,
            ] : null,
            'sentRequest' => $sentRequest ? [
                'id' => $sentRequest->id,
                'status' => $sentRequest->status,
            ] : null,
            'mutualConnectionsCount' => count($mutualConnections),
            'mutualConnections' => $mutualConnections->take(5)->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
            ]),
        ]);
    }
}
