<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeService as ConnectionTreeService;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Models\GuestModels\User;
use Illuminate\Http\Request;
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
        $parentAvailability = $this->connectionTreeService->getParentAvailability($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/YourTree/Index', [
            'connectionTreeData' => $connectionTreeData,
            'user' => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
                'status' => $user->status,
            ],
            'hasPaternal' => $parentAvailability['hasPaternal'],
            'hasMaternal' => $parentAvailability['hasMaternal'],
        ]);
    }

    /**
     * Display another user's connection tree visualization
     */
    public function viewUserTree(string $username)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return redirect()->route('home');
        }

        $owner = User::where('username', $username)->firstOrFail();

        // Users can always view their own tree
        if ($viewer->id === $owner->id) {
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
        $connectionTreeData = $this->connectionTreeService->buildFamilyTree($owner->id);

        // Apply nuclear family blur if needed
        $shouldBlurNuclearFamily = $owner->blur_nuclear_family_for_public && !$this->isConnectedDirect($viewer, $owner) && $viewer->id !== $owner->id;

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
            'isOwnTree' => $viewer->id === $owner->id,
        ]);
    }

    /**
     * Get tree data for a user via API (for inline tree switching)
     */
    public function getTreeData(int $userId)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $owner = User::find($userId);

        if (!$owner) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Users can always view their own tree
        if ($viewer->id === $userId) {
            $canView = true;
        } else {
            // Check tree visibility based on profile visibility settings
            $canView = $this->canViewTree($viewer, $owner);
        }

        if (!$canView) {
            return response()->json(['error' => 'You do not have permission to view this family tree.'], 403);
        }

        // Build scoped tree when viewing someone else's tree, full tree for own tree
        if ($viewer->id !== $userId) {
            $relationshipHint = request()->query('relationshipHint');

            // Determine if this is an "upward" node (parent/grandparent types)
            $upwardTypes = [
                'father', 'mother', 'parent',
                'grandfather', 'grandmother', 'grandparent',
                'great_grandfather', 'great_grandmother',
                'great_great_grandfather', 'great_great_grandmother',
            ];

            if ($relationshipHint && in_array($relationshipHint, $upwardTypes)) {
                $connectionTreeData = $this->connectionTreeService->buildUpwardScopedTree($userId, $viewer->id, $relationshipHint);
            } else {
                $connectionTreeData = $this->connectionTreeService->buildScopedTree($userId, $viewer->id, $relationshipHint);
            }
        } else {
            $connectionTreeData = $this->connectionTreeService->buildFamilyTree($userId);
        }

        // Apply nuclear family blur if needed (viewer node should never be blurred)
        $shouldBlurNuclearFamily = $owner->blur_nuclear_family_for_public && !$this->isConnectedDirect($viewer, $owner) && $viewer->id !== $userId;

        if ($shouldBlurNuclearFamily) {
            // Add shouldBlur flag to nuclear family nodes
            $connectionTreeData['nodes'] = array_map(function ($node) use ($owner, $viewer) {
                if ($node['id'] === $viewer->id) {
                    $node['shouldBlur'] = false;
                    return $node;
                }
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

        $parentAvailability = $this->connectionTreeService->getParentAvailability($owner->id);

        return response()->json([
            'success' => true,
            'connectionTreeData' => $connectionTreeData,
            'owner' => [
                'id' => $owner->id,
                'name' => trim(($owner->first_name ?? '') . ' ' . ($owner->last_name ?? '')),
                'username' => $owner->username,
                'profile_image_url' => $owner->profile_image_url,
                'status' => $owner->status,
            ],
            'hasPaternal' => $parentAvailability['hasPaternal'],
            'hasMaternal' => $parentAvailability['hasMaternal'],
        ]);
    }

    /**
     * Get expanded ancestral view (paternal/maternal lineage traced to topmost ancestor)
     */
    public function getExpandedView(Request $request)
    {
        $viewer = auth()->user();

        if (!$viewer) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $userId = (int) $request->query('userId');
        $side = $request->query('side');

        if (!in_array($side, ['paternal', 'maternal'])) {
            return response()->json(['error' => 'Invalid side parameter'], 400);
        }

        $ancestorId = $this->connectionTreeService->findTopmostAncestor($userId, $side);

        if (!$ancestorId) {
            return response()->json(['error' => 'No ancestor found'], 404);
        }

        $ancestor = User::find($ancestorId);

        if (!$ancestor) {
            return response()->json(['error' => 'Ancestor not found'], 404);
        }

        // Build the ancestor's full tree (bypasses privacy - ancestral lineage always visible)
        $connectionTreeData = $this->connectionTreeService->buildFamilyTree($ancestorId);
        $parentAvailability = $this->connectionTreeService->getParentAvailability($ancestorId);

        return response()->json([
            'success' => true,
            'connectionTreeData' => $connectionTreeData,
            'owner' => [
                'id' => $ancestor->id,
                'name' => trim(($ancestor->first_name ?? '') . ' ' . ($ancestor->last_name ?? '')),
                'username' => $ancestor->username,
                'profile_image_url' => $ancestor->profile_image_url,
                'status' => $ancestor->status,
            ],
            'hasPaternal' => $parentAvailability['hasPaternal'],
            'hasMaternal' => $parentAvailability['hasMaternal'],
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
