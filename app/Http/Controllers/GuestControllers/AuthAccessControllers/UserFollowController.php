<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\UserFollowService;
use App\Actions\GuestServices\NotificationService;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;

class UserFollowController extends Controller
{
    public function __construct(
        private UserFollowService $followService,
        private UserConnectionRepository $connectionRepository,
        private NotificationService $notificationService,
        private ProfilePrivacyService $privacyService,
    ) {}

    /**
     * Follow a user
     */
    public function follow(string $userUuid)
    {
        try {
            $user = auth()->user();
            $targetUser = User::where('uuid', $userUuid)->firstOrFail();
            $this->followService->followUser($user, $targetUser->id);

            return back()->with('success', 'Successfully followed user!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(string $userUuid)
    {
        try {
            $user = auth()->user();
            $targetUser = User::where('uuid', $userUuid)->firstOrFail();
            $this->followService->unfollowUser($user, $targetUser->id);

            return back()->with('success', 'Successfully unfollowed user!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * View followers list for a user
     */
    public function followers(string $userUuid)
    {
        $viewer = auth()->user();
        $targetUser = User::where('uuid', $userUuid)->firstOrFail();
        $userId = $targetUser->id;

        // Get followers list
        $followers = $this->followService->getFollowersList($userId, $viewer->id);

        // Get follow status for the target user
        $followStatus = $this->followService->getFollowStatus($viewer->id, $userId);

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $targetUser->id);

        // Check if they are connected and get relationship type from viewer's perspective
        $connectionStatus = null;
        $relationshipType = null;
        $connection = null;
        $canUndoConnection = false;

        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $relationshipType = $this->connectionRepository->getRelationshipFromViewerPerspective($viewer->id, $targetUser->id);
            if ($relationshipType) {
                $connectionStatus = 'connected';
                $connection = $this->connectionRepository->getConnectionBetween($viewer->id, $targetUser->id);
                if ($connection) {
                    $canUndoConnection = $connection->canUndo();
                }
            }
        }

        // Check for pending/sent requests
        $pendingRequest = null;
        $sentRequest = null;

        if ($connectionStatus !== 'connected') {
            $pendingRequest = $this->connectionRepository->getPendingRequestBetween($viewer->id, $targetUser->id);
            $sentRequest = $this->connectionRepository->getSentRequestBetween($viewer->id, $targetUser->id);
        }

        // Get mutual connections count
        $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $targetUser->id);

        return Inertia::render('GuestPages/AuthAccessPages/Follow/FollowersList', [
            'profile' => [
                'id' => $targetUser->id,
                'uuid' => $targetUser->uuid,
                'name' => trim($targetUser->first_name . ' ' . $targetUser->last_name),
                'username' => $targetUser->username,
                'profile_image_url' => $targetUser->profile_image_url,
                'bio' => $targetUser->bio,
                'status' => $targetUser->status,
            ],
            'followers' => $followers,
            'relationshipContext' => $relationshipContext,
            'connectionStatus' => $connectionStatus,
            'relationshipType' => $relationshipType,
            'relationshipLabel' => $relationshipType ? ucfirst(str_replace('_', ' ', $relationshipType)) : null,
            'connectionId' => $connection?->id,
            'canUndoConnection' => $canUndoConnection,
            'pendingRequest' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'status' => $pendingRequest->status,
            ] : null,
            'sentRequest' => $sentRequest ? [
                'id' => $sentRequest->id,
                'status' => $sentRequest->status,
            ] : null,
            'mutualConnectionsCount' => count($mutualConnections),
            'isFollowing' => $followStatus['is_following'],
            'isFollowedBy' => $followStatus['is_followed_by'],
            'followerCount' => $followStatus['follower_count'],
            'followingCount' => $followStatus['following_count'],
            'isOwnProfile' => $viewer->id === $userId,
        ]);
    }

    /**
     * View following list for a user
     */
    public function following(string $userUuid)
    {
        $viewer = auth()->user();
        $targetUser = User::where('uuid', $userUuid)->firstOrFail();
        $userId = $targetUser->id;

        // Get following list
        $following = $this->followService->getFollowingList($userId, $viewer->id);

        // Get follow status for the target user
        $followStatus = $this->followService->getFollowStatus($viewer->id, $userId);

        // Get relationship context
        $relationshipContext = $this->privacyService->getRelationshipContext($viewer->id, $targetUser->id);

        // Check if they are connected and get relationship type from viewer's perspective
        $connectionStatus = null;
        $relationshipType = null;
        $connection = null;
        $canUndoConnection = false;

        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $relationshipType = $this->connectionRepository->getRelationshipFromViewerPerspective($viewer->id, $targetUser->id);
            if ($relationshipType) {
                $connectionStatus = 'connected';
                $connection = $this->connectionRepository->getConnectionBetween($viewer->id, $targetUser->id);
                if ($connection) {
                    $canUndoConnection = $connection->canUndo();
                }
            }
        }

        // Check for pending/sent requests
        $pendingRequest = null;
        $sentRequest = null;

        if ($connectionStatus !== 'connected') {
            $pendingRequest = $this->connectionRepository->getPendingRequestBetween($viewer->id, $targetUser->id);
            $sentRequest = $this->connectionRepository->getSentRequestBetween($viewer->id, $targetUser->id);
        }

        // Get mutual connections count
        $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $targetUser->id);

        return Inertia::render('GuestPages/AuthAccessPages/Follow/FollowingList', [
            'profile' => [
                'id' => $targetUser->id,
                'uuid' => $targetUser->uuid,
                'name' => trim($targetUser->first_name . ' ' . $targetUser->last_name),
                'username' => $targetUser->username,
                'profile_image_url' => $targetUser->profile_image_url,
                'bio' => $targetUser->bio,
                'status' => $targetUser->status,
            ],
            'following' => $following,
            'relationshipContext' => $relationshipContext,
            'connectionStatus' => $connectionStatus,
            'relationshipType' => $relationshipType,
            'relationshipLabel' => $relationshipType ? ucfirst(str_replace('_', ' ', $relationshipType)) : null,
            'connectionId' => $connection?->id,
            'canUndoConnection' => $canUndoConnection,
            'pendingRequest' => $pendingRequest ? [
                'id' => $pendingRequest->id,
                'status' => $pendingRequest->status,
            ] : null,
            'sentRequest' => $sentRequest ? [
                'id' => $sentRequest->id,
                'status' => $sentRequest->status,
            ] : null,
            'mutualConnectionsCount' => count($mutualConnections),
            'isFollowing' => $followStatus['is_following'],
            'isFollowedBy' => $followStatus['is_followed_by'],
            'followerCount' => $followStatus['follower_count'],
            'followingCount' => $followStatus['following_count'],
            'isOwnProfile' => $viewer->id === $userId,
        ]);
    }
}
