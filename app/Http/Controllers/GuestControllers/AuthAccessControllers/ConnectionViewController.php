<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Actions\GuestServices\AuthAccessServices\UserBlockService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;
use Inertia\Inertia;

class ConnectionViewController extends Controller
{
    public function __construct(
        private ProfilePrivacyService $privacyService,
        private UserConnectionRepository $connectionRepository,
        private UserBlockService $blockService,
    ) {}

    /**
     * View another user's connections
     */
    public function viewUserConnections(int $userId)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return redirect()->route('home');
        }

        $owner = User::with('familyInfo')->findOrFail($userId);

        // Users can view their own connections
        // For other users, check access permissions
        if ($viewer->id !== $owner->id) {
            // Check if viewer has blocked the owner
            if ($this->blockService->hasBlocked($viewer, $owner->id)) {
                return abort(403, 'You have blocked this user.');
            }

            // Check if owner has blocked the viewer
            if ($this->blockService->isBlockedBy($viewer, $owner->id)) {
                return abort(403, 'This user has blocked you.');
            }

            // Check profile visibility settings
            $canViewProfile = $this->canViewProfile($viewer, $owner);
            if (!$canViewProfile) {
                return abort(403, 'You do not have permission to view this user\'s connections.');
            }
        }

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $owner->id);

        // Check if they are connected and get relationship type
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

        // Get all connections of the owner
        $allConnections = $this->connectionRepository->getConnections($owner->id);

        // Extract actual user objects from connections
        $connectionUsers = $allConnections->map(function ($connection) use ($owner) {
            return $connection->requester_user_id === $owner->id ? $connection->recipient : $connection->requester;
        })->filter();

        // Format user data for response
        $formattedConnections = $connectionUsers->map(fn ($user) => [
            'id' => $user->id,
            'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
            'username' => $user->username,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
        ]);

        // Get mutual connections for the left sidebar display
        $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $owner->id);
        $mutualConnectionsCount = count($mutualConnections);

        return Inertia::render('GuestPages/AuthAccessPages/Connections/ViewUserConnections', [
            'user' => [
                'id' => $owner->id,
                'name' => trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? '')),
                'username' => $owner->username,
                'profile_image_url' => $owner->profile_image_url,
                'status' => $owner->status,
                'bio' => $owner->bio,
            ],
            'userId' => $owner->id,
            'connections' => $formattedConnections,
            'connectionCount' => $connectionUsers->count(),
            'mutualConnectionsCount' => $mutualConnectionsCount,
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
            'relationshipContext' => $relationshipContext,
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
     */
    private function isConnectedDirect(User $viewer, User $owner): bool
    {
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
     */
    private function isConnectedIndirect(User $viewer, User $owner): bool
    {
        $viewerConnections = $this->connectionRepository->getConnections($viewer->id);

        if ($viewerConnections->isEmpty()) {
            return false;
        }

        $viewerConnectionIds = $viewerConnections->map(function ($connection) use ($viewer) {
            return $connection->requester_user_id === $viewer->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;
        })->toArray();

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
