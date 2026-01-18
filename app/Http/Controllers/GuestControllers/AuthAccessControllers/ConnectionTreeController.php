<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeService as ConnectionTreeService;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;
use Inertia\Inertia;

class ConnectionTreeController extends Controller
{
    public function __construct(
        private ConnectionTreeService $connectionTreeService,
        private UserConnectionRepository $connectionRepository,
        private ProfilePrivacyService $privacyService
    ) {}

    /**
     * Display the user's connection tree visualization
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Get connection tree data for visualization
        $connectionTreeData = $this->connectionTreeService->buildFamilyTree($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/YourTree/Index', [
            'connectionTreeData' => $connectionTreeData,
            'user' => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
                'status' => $user->status,
            ],
        ]);
    }

    /**
     * Display another user's connection tree visualization
     */
    public function viewUserTree(int $userId)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return redirect()->route('home');
        }

        $owner = User::findOrFail($userId);

        // Users can always view their own tree
        if ($viewer->id === $userId) {
            $canView = true;
        } else {
            // Check tree visibility based on profile visibility settings
            $canView = $this->canViewTree($viewer, $owner);
        }

        if (!$canView) {
            return redirect()->route('profile.view', ['username' => $owner->username])
                ->with('error', 'You do not have permission to view this family tree.');
        }

        // Get connection tree data for the specified user
        $connectionTreeData = $this->connectionTreeService->buildFamilyTree($userId);

        // Apply nuclear family blur if needed
        $shouldBlurNuclearFamily = $owner->blur_nuclear_family_for_public && !$this->isConnectedDirect($viewer, $owner) && $viewer->id !== $userId;

        if ($shouldBlurNuclearFamily) {
            // Add shouldBlur flag to nuclear family nodes
            $connectionTreeData['nodes'] = array_map(function ($node) use ($owner) {
                $isNuclearFamily = $this->privacyService->getRelationshipContext($node['id'], $owner->id) === 'nuclear_family';
                $node['shouldBlur'] = $isNuclearFamily;
                return $node;
            }, $connectionTreeData['nodes']);
        } else {
            // Ensure all nodes have shouldBlur set to false
            $connectionTreeData['nodes'] = array_map(function ($node) {
                $node['shouldBlur'] = false;
                return $node;
            }, $connectionTreeData['nodes']);
        }

        return Inertia::render('GuestPages/AuthAccessPages/ViewUserTree/Index', [
            'connectionTreeData' => $connectionTreeData,
            'owner' => [
                'id' => $owner->id,
                'name' => trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? '')),
                'username' => $owner->username,
                'profile_image_url' => $owner->profile_image_url,
                'status' => $owner->status,
            ],
            'isOwnTree' => $viewer->id === $userId,
        ]);
    }

    /**
     * Check if a viewer can view the owner's tree based on visibility setting
     * Tree visibility follows the same rules as profile visibility
     */
    private function canViewTree(User $viewer, User $owner): bool
    {
        $visibility = $owner->profile_visibility ?? 'connected';

        return match ($visibility) {
            'public' => true,
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
}
