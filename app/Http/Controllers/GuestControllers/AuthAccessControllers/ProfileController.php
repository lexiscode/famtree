<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Actions\GuestServices\AuthAccessServices\UserBlockService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private ProfilePrivacyService $privacyService,
        private UserConnectionRepository $connectionRepository,
        private UserBlockService $blockService,
    ) {}

    /**
     * View another user's profile (with privacy filtering)
     */
    public function viewProfile(int $userId)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return redirect()->route('home');
        }

        $owner = User::with('familyInfo')->findOrFail($userId);

        // Track if access is denied (for modal display)
        $accessDenied = false;
        $accessDeniedReason = null;

        // Users can always view their own profile
        if ($viewer->id === $owner->id) {
            // Continue to full profile display below
        } else {
            // Check if viewer has blocked the owner
            if ($this->blockService->hasBlocked($viewer, $owner->id)) {
                $accessDenied = true;
                $accessDeniedReason = 'You have blocked this user and cannot view their profile.';
            }

            // Check if owner has blocked the viewer
            if ($this->blockService->isBlockedBy($viewer, $owner->id)) {
                $accessDenied = true;
                $accessDeniedReason = 'This user has blocked you and you cannot view their profile.';
            }

            // Check profile visibility settings
            if (!$accessDenied) {
                $canViewProfile = $this->canViewProfile($viewer, $owner);
                if (!$canViewProfile) {
                    $accessDenied = true;
                    $accessDeniedReason = 'You do not have permission to view this profile.';
                }
            }
        }

        // Get field visibility info (which fields can viewer see)
        $fieldVisibility = $this->privacyService->getFieldVisibility($viewer->id, $owner->id);

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $owner->id);

        // Format profile data for frontend
        // Always show full name (displayed in header, not subject to field-level privacy)
        $visibleName = null;
        if ($relationshipContext !== null) {
            $visibleName = trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? ''));
        }

        // Check if they are connected and get relationship type from viewer's perspective
        $connectionStatus = null;
        $relationshipType = null;

        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $relationshipType = $this->connectionRepository->getRelationshipFromViewerPerspective($viewer->id, $owner->id);
            if ($relationshipType) {
                $connectionStatus = 'connected';
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
        $nonMutualConnections = [];
        $allOwnerConnections = collect([]);
        $allOwnerConnectionUsers = collect([]);

        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $owner->id);
            // Get all connections of the owner
            $allOwnerConnections = $this->connectionRepository->getConnections($owner->id);

            // Extract actual user objects from connections
            $allOwnerConnectionUsers = $allOwnerConnections->map(function ($connection) use ($owner) {
                // Return the other user in the connection (not the owner)
                return $connection->requester_user_id === $owner->id ? $connection->recipient : $connection->requester;
            })->filter(); // Remove null values

            // Filter out mutual connections to get non-mutual ones
            $mutualIds = collect($mutualConnections)->pluck('id')->toArray();
            $nonMutualConnections = $allOwnerConnectionUsers->filter(fn ($user) => !in_array($user->id, $mutualIds))->take(5);
        }

        // Get actual user data (for blur effect in frontend)
        // Always send actual data - visibility is controlled by visibleFields
        $actualUserData = [
            'full_name' => trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? '')),
            'email' => $owner->email,
            'phone' => $owner->phone,
            'address' => $owner->address,
            'date_of_birth' => $owner->date_of_birth,
            'gender' => $owner->gender,
            'bio' => $owner->bio,
            'profile_image_url' => $owner->profile_image_url,
            'status' => $owner->status,
            'job_title' => $owner->familyInfo?->current_occupation ?? null,
            'education' => $owner->familyInfo?->education_level ?? null,
        ];

        $profileData = [
            'id' => $owner->id,
            'name' => $visibleName,
            'username' => $owner->username,
            'email' => $actualUserData['email'],
            'phone' => $actualUserData['phone'],
            'address' => $actualUserData['address'],
            'date_of_birth' => $actualUserData['date_of_birth'],
            'gender' => $actualUserData['gender'],
            'bio' => $actualUserData['bio'],
            'profile_image_url' => $actualUserData['profile_image_url'],
            'status' => $actualUserData['status'],
            'job_title' => $actualUserData['job_title'],
            'education' => $actualUserData['education'],
            'created_at' => $owner->created_at,
        ];

        // Format visible fields info - use fieldVisibility from service
        $visibleFields = [];
        foreach ($fieldVisibility as $fieldName => $fieldData) {
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
            'relationshipLabel' => $relationshipType ? ucfirst(str_replace('_', ' ', $relationshipType)) : null,
            'pendingRequest' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'status' => $pendingRequest->status,
            ] : null,
            'sentRequest' => $sentRequest ? [
                'id' => $sentRequest->id,
                'status' => $sentRequest->status,
            ] : null,
            'mutualConnectionsCount' => count($mutualConnections),
            'mutualConnections' => collect($mutualConnections)->take(5)->map(fn ($user) => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
            ]),
            'nonMutualConnectionsCount' => $allOwnerConnectionUsers->count() - count($mutualConnections),
            'nonMutualConnections' => collect($nonMutualConnections)->map(fn ($user) => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
            ]),
            'accessDenied' => $accessDenied,
            'accessDeniedReason' => $accessDeniedReason,
        ]);
    }

    /**
     * Check if a viewer can view the owner's profile based on visibility setting
     */
    private function canViewProfile(User $viewer, User $owner): bool
    {
        $visibility = $owner->profile_visibility ?? 'connected';

        return match ($visibility) {
            'public' => $this->isConnectedDirect($viewer, $owner) || $this->isConnectedIndirect($viewer, $owner),
            'connected' => $this->isConnectedDirect($viewer, $owner),
            'private' => false,
            default => false,
        };
    }

    /**
     * Check if two users are directly connected
     * Direct connection = both users have an accepted connection record between them
     */
    private function isConnectedDirect(User $viewer, User $owner): bool
    {
        // Get connections of viewer and check if owner is among them
        $viewerConnections = $this->connectionRepository->getConnections($viewer->id);

        foreach ($viewerConnections as $connection) {
            $connectedUserId = $connection->requester_user_id === $viewer->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            if ($connectedUserId === $owner->id) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if two users are indirectly connected
     * Indirect connection = viewer is connected to someone who is connected to owner
     * This allows viewing through mutual connections (public profiles)
     */
    private function isConnectedIndirect(User $viewer, User $owner): bool
    {
        // Get all direct connections of the viewer
        $viewerConnections = $this->connectionRepository->getConnections($viewer->id);

        if ($viewerConnections->isEmpty()) {
            return false;
        }

        // Extract the user IDs of the viewer's connections
        $viewerConnectionIds = $viewerConnections->map(function ($connection) use ($viewer) {
            return $connection->requester_user_id === $viewer->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;
        })->toArray();

        // Check if any of the viewer's connections are also connected to the owner
        $ownerConnections = $this->connectionRepository->getConnections($owner->id);

        foreach ($ownerConnections as $connection) {
            $connectedUserId = $connection->requester_user_id === $owner->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            if (in_array($connectedUserId, $viewerConnectionIds)) {
                return true;
            }
        }

        return false;
    }
}
