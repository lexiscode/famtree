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

        // Check if viewer has blocked the owner
        if ($this->blockService->hasBlocked($viewer, $owner->id)) {
            return abort(403, 'You have blocked this user and cannot view their profile.');
        }

        // Check if owner has blocked the viewer
        if ($this->blockService->isBlockedBy($viewer, $owner->id)) {
            return abort(403, 'This user has blocked you and you cannot view their profile.');
        }

        // Get visible profile data based on privacy settings
        $visibleData = $this->privacyService->getFormattedProfileData($viewer->id, $owner->id);

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $owner->id);

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
            $mutualIds = $mutualConnections->pluck('id')->toArray();
            $nonMutualConnections = $allOwnerConnectionUsers->filter(fn ($user) => !in_array($user->id, $mutualIds))->take(5);
        }

        // Format profile data for frontend
        // Always show full name to connected users
        $visibleName = null;
        if ($visibleData['full_name']['visible'] || $relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $visibleName = trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? ''));
        }

        $profileData = [
            'id' => $owner->id,
            'name' => $visibleName,
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
            'mutualConnections' => $mutualConnections->take(5)->map(fn ($user) => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
            ]),
            'nonMutualConnectionsCount' => $allOwnerConnectionUsers->count() - count($mutualConnections),
            'nonMutualConnections' => $nonMutualConnections->map(fn ($user) => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
            ]),
        ]);
    }
}
