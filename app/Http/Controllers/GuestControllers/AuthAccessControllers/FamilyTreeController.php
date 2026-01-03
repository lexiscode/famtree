<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeService;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeValidationService;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeMergeService;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeConnectionRepository;
use App\Models\GuestModels\FamilyTree;
use App\Models\GuestModels\FamilyTreeConnection;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FamilyTreeController extends Controller
{
    public function __construct(
        private FamilyTreeService $treeService,
        private FamilyTreeRepository $treeRepository,
        private FamilyTreeAdminRepository $adminRepository,
        private FamilyTreeConnectionRepository $connectionRepository,
        private FamilyTreeValidationService $validationService,
        private FamilyTreeMergeService $mergeService,
        private \App\Repositories\GuestRepositories\UserConnectionRepository $userConnectionRepository
    ) {}

    /**
     * Get user profile data for ProfileSidebar
     */
    private function getUserProfileData($user): array
    {
        $user->load('familyInfo');

        return [
            'id' => $user->id,
            'name' => $user->first_name . ' ' . $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'status' => $user->status ?? 'alive',
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'profile_image_url' => $user->profile_image_url,
            'created_at' => $user->created_at,
        ];
    }

    /**
     * Display user's family trees (where user is admin)
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Get trees where user is admin (excluding merged trees)
        $adminTrees = $this->adminRepository->getUserAdminTrees($user->id);

        // Get trees user is a member of (but not admin)
        $memberTrees = $this->treeRepository->getUserMemberTrees($user->id)
            ->filter(function ($tree) use ($user) {
                return !$this->adminRepository->isAdmin($tree->id, $user->id);
            });

        // Check if user has already created a tree (as creator, not co-admin)
        $hasCreatedTree = $this->adminRepository->getUserAdminTrees($user->id)
            ->contains(function ($tree) use ($user) {
                return $tree->admins->where('user_id', $user->id)->where('role', 'creator')->isNotEmpty();
            });

        // Get user profile data and connection counts for sidebar
        $userProfile = $this->getUserProfileData($user);
        $connectionCount = $this->userConnectionRepository->getConnectionCount($user->id);
        $pendingRequestCount = $this->userConnectionRepository->getPendingRequestCount($user->id);
        $sentRequestCount = $this->userConnectionRepository->getSentRequestCount($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/Index', [
            'user' => $userProfile,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0,
            'hasCreatedTree' => $hasCreatedTree,
            'adminTrees' => $adminTrees->map(fn($tree) => [
                'id' => $tree->uuid,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'is_nuclear_family' => $tree->is_nuclear_family,
                'member_count' => $this->treeRepository->getMemberCount($tree->id),
                'admins' => $tree->admins->map(fn($admin) => [
                    'id' => $admin->user->id,
                    'name' => trim($admin->user->first_name . ' ' . $admin->user->last_name),
                    'role' => $admin->role,
                ]),
                'created_at' => $tree->created_at,
            ]),
            'memberTrees' => $memberTrees->map(fn($tree) => [
                'id' => $tree->uuid,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'is_nuclear_family' => $tree->is_nuclear_family ?? false,
                'member_count' => $this->treeRepository->getMemberCount($tree->id),
                'admins' => $tree->admins->map(fn($admin) => [
                    'id' => $admin->user->id,
                    'name' => trim($admin->user->first_name . ' ' . $admin->user->last_name),
                    'role' => $admin->role,
                ]),
                'created_at' => $tree->created_at,
            ]),
        ]);
    }

    /**
     * Show create family tree form
     */
    public function create()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check if user has already created a tree (as creator, not co-admin)
        $hasCreatedTree = $this->adminRepository->getUserAdminTrees($user->id)
            ->contains(function ($tree) use ($user) {
                return $tree->admins->where('user_id', $user->id)->where('role', 'creator')->isNotEmpty();
            });

        if ($hasCreatedTree) {
            return redirect()->route('family-tree.index')
                ->with('error', 'You have already created a family tree. You can only create one tree, but you can merge with other trees to expand your family network.');
        }

        // Validate if user can create a tree
        $validation = $this->validationService->canCreateFamilyTree($user);

        // Get nuclear family members for preview
        $nuclearFamilyMembers = [];
        if ($validation['can_create']) {
            $members = $this->validationService->getNuclearFamilyMemberIds($user->id);
            foreach ($members as $member) {
                $memberUser = \App\Models\GuestModels\User::find($member['user_id']);
                if ($memberUser) {
                    $nuclearFamilyMembers[] = [
                        'user_id' => $memberUser->id,
                        'name' => trim($memberUser->first_name . ' ' . $memberUser->last_name),
                        'profile_image_url' => $memberUser->profile_image_url,
                        'role' => $member['role'],
                    ];
                }
            }
        }

        // Get user profile data and connection counts for sidebar
        $userProfile = $this->getUserProfileData($user);
        $connectionCount = $this->userConnectionRepository->getConnectionCount($user->id);
        $pendingRequestCount = $this->userConnectionRepository->getPendingRequestCount($user->id);
        $sentRequestCount = $this->userConnectionRepository->getSentRequestCount($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/CreateTree', [
            'user' => $userProfile,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0,
            'canCreate' => $validation['can_create'],
            'validationErrors' => $validation['errors'],
            'nuclearFamilyMembers' => $nuclearFamilyMembers,
        ]);
    }

    /**
     * Store a new nuclear family tree
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check if user has already created a tree (as creator, not co-admin)
        $hasCreatedTree = $this->adminRepository->getUserAdminTrees($user->id)
            ->contains(function ($tree) use ($user) {
                return $tree->admins->where('user_id', $user->id)->where('role', 'creator')->isNotEmpty();
            });

        if ($hasCreatedTree) {
            return redirect()->route('family-tree.index')
                ->with('error', 'You have already created a family tree. You can only create one tree, but you can merge with other trees to expand your family network.');
        }

        $validated = $request->validate([
            'tree_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        // Create nuclear family tree with validation
        $result = $this->treeService->createNuclearFamilyTree($user, $validated);

        if (!$result['success']) {
            return back()->withErrors($result['errors']);
        }

        return redirect()->route('family-tree.show', $result['tree']->uuid)
            ->with('success', "Nuclear family tree created successfully! {$result['members_added']} members added.");
    }

    /**
     * Show a family tree
     */
    public function show(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check access (admin or member)
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);

        if (!$isAdmin && !$isMember && !$familyTree->is_public) {
            abort(403, 'Unauthorized to view this family tree');
        }

        // Get tree admins and members
        $admins = $this->adminRepository->getTreeAdmins($familyTree->id);
        $members = $this->treeRepository->getTreeMembers($familyTree->id);

        // Get pending tree connection requests if admin
        $pendingRequests = $isAdmin ? $this->connectionRepository->getPendingRequests($familyTree->id) : collect();
        $sentRequests = $isAdmin ? $this->connectionRepository->getSentRequests($familyTree->id) : collect();

        // Get available members to add (nuclear family members not already in tree) - for admins only
        $availableMembers = [];
        if ($isAdmin) {
            $nuclearFamilyMembers = $this->validationService->getNuclearFamilyMemberIds($user->id);
            $currentMemberIds = $members->pluck('user_id')->toArray();

            foreach ($nuclearFamilyMembers as $member) {
                if (!in_array($member['user_id'], $currentMemberIds)) {
                    $memberUser = \App\Models\GuestModels\User::find($member['user_id']);
                    if ($memberUser) {
                        $availableMembers[] = [
                            'user_id' => $memberUser->id,
                            'name' => trim($memberUser->first_name . ' ' . $memberUser->last_name),
                            'profile_image_url' => $memberUser->profile_image_url,
                            'role' => $member['role'],
                        ];
                    }
                }
            }
        }

        // Get user profile data and connection counts for sidebar
        $userProfile = $this->getUserProfileData($user);
        $connectionCount = $this->userConnectionRepository->getConnectionCount($user->id);
        $pendingRequestCount = $this->userConnectionRepository->getPendingRequestCount($user->id);
        $sentRequestCount = $this->userConnectionRepository->getSentRequestCount($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/MyFamilyTree', [
            'user' => $userProfile,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0,
            'tree' => [
                'id' => $familyTree->uuid,
                'name' => $familyTree->tree_name,
                'description' => $familyTree->description,
                'is_public' => $familyTree->is_public,
                'is_nuclear_family' => $familyTree->is_nuclear_family,
                'created_at' => $familyTree->created_at,
            ],
            'admins' => $admins->map(fn($admin) => [
                'id' => $admin->user->id,
                'name' => trim($admin->user->first_name . ' ' . $admin->user->last_name),
                'role' => $admin->role,
                'granted_at' => $admin->granted_at,
            ]),
            'members' => $members->map(fn($member) => [
                'id' => $member->user->id,
                'name' => trim($member->user->first_name . ' ' . $member->user->last_name),
                'profile_image_url' => $member->user->profile_image_url,
                'nuclear_family_role' => $member->nuclear_family_role,
                'can_add_members' => $member->can_add_members,
                'added_at' => $member->added_at,
            ]),
            'pendingRequests' => $pendingRequests,
            'sentRequests' => $sentRequests,
            'availableMembers' => $availableMembers,
            'isAdmin' => $isAdmin,
            'isMember' => $isMember,
            'canAddMembers' => $this->treeService->canAddMembers($familyTree->id, $user->id),
        ]);
    }

    /**
     * Show edit family tree form
     */
    public function edit(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($familyTree->id, $user->id)) {
            abort(403, 'Unauthorized to edit this family tree');
        }

        // Get user profile data and connection counts for sidebar
        $userProfile = $this->getUserProfileData($user);
        $connectionCount = $this->userConnectionRepository->getConnectionCount($user->id);
        $pendingRequestCount = $this->userConnectionRepository->getPendingRequestCount($user->id);
        $sentRequestCount = $this->userConnectionRepository->getSentRequestCount($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/EditTree', [
            'user' => $userProfile,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => $pendingRequestCount,
            'sentRequestCount' => $sentRequestCount,
            'unreadNotificationCount' => 0,
            'tree' => [
                'id' => $familyTree->uuid,
                'name' => $familyTree->tree_name,
                'description' => $familyTree->description,
                'is_public' => $familyTree->is_public,
            ],
        ]);
    }

    /**
     * Update a family tree
     */
    public function update(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($familyTree->id, $user->id)) {
            abort(403, 'Unauthorized to update this family tree');
        }

        $validated = $request->validate([
            'tree_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        $this->treeRepository->update($familyTree->id, [
            'tree_name' => $validated['tree_name'],
            'description' => $validated['description'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return redirect()->route('family-tree.show', $familyTree->uuid)
            ->with('success', 'Family tree updated successfully!');
    }

    /**
     * Add a nuclear family member to the tree
     */
    public function addMember(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $result = $this->treeService->addNuclearFamilyMember($familyTree->id, $validated['user_id'], $user->id);

        if (!$result['success']) {
            return redirect()->back()->with('error', $result['error']);
        }

        return redirect()->route('family-tree.show', $familyTree->uuid)
            ->with('success', $result['message']);
    }

    /**
     * Remove a member from family tree
     */
    public function removeMember(Request $request, FamilyTree $familyTree, int $userId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($familyTree->id, $user->id)) {
            abort(403, 'Unauthorized to modify this family tree');
        }

        $this->treeRepository->removeMember($familyTree->id, $userId);

        return redirect()->route('family-tree.show', $familyTree->uuid)
            ->with('success', 'Member removed successfully');
    }

    /**
     * Delete a family tree
     */
    public function destroy(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($familyTree->id, $user->id)) {
            abort(403, 'Unauthorized to delete this family tree');
        }

        $this->treeRepository->delete($familyTree->id);

        return redirect()->route('family-tree.index')
            ->with('success', 'Family tree deleted successfully!');
    }

    /**
     * Get tree data as JSON (admins and members)
     */
    public function getTreeData(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check access
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);

        if (!$isAdmin && !$isMember && !$familyTree->is_public) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $admins = $this->adminRepository->getTreeAdmins($familyTree->id);
        $members = $this->treeRepository->getTreeMembers($familyTree->id);

        return response()->json([
            'tree' => [
                'id' => $familyTree->uuid,
                'name' => $familyTree->tree_name,
                'is_nuclear_family' => $familyTree->is_nuclear_family,
            ],
            'admins' => $admins,
            'members' => $members,
        ]);
    }

    /**
     * Send a connection request to another family tree
     */
    public function sendConnectionRequest(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'my_tree_id' => 'required|string|exists:family_trees,uuid',
            'target_tree_id' => 'required|string|exists:family_trees,uuid',
            'message' => 'nullable|string|max:500',
        ]);

        // Find trees by UUID
        $myTree = FamilyTree::where('uuid', $validated['my_tree_id'])->firstOrFail();
        $targetTree = FamilyTree::where('uuid', $validated['target_tree_id'])->firstOrFail();

        // Verify user is admin of their tree
        if (!$this->adminRepository->isAdmin($myTree->id, $user->id)) {
            return response()->json(['error' => 'You must be an admin of your family tree to send connection requests'], 403);
        }

        // Check if connection already exists
        if ($this->connectionRepository->connectionExists($myTree->id, $targetTree->id)) {
            return response()->json(['error' => 'A connection request already exists between these trees'], 400);
        }

        $connection = $this->connectionRepository->sendRequest(
            $myTree->id,
            $targetTree->id,
            $user->id,
            $validated['message'] ?? null
        );

        return response()->json([
            'message' => 'Connection request sent successfully',
            'connection' => $connection,
        ]);
    }

    /**
     * Accept a tree connection request (merges the trees)
     */
    public function acceptConnectionRequest(FamilyTreeConnection $connection)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify user is admin of the recipient tree
        if (!$this->adminRepository->isAdmin($connection->recipient_tree_id, $user->id)) {
            return response()->json(['error' => 'You must be an admin of the recipient tree to accept this request'], 403);
        }

        // Merge the trees
        $result = $this->mergeService->mergeTrees($connection->id, $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['message']], 400);
        }

        // Get the merged tree UUID
        $mergedTree = FamilyTree::find($result['merged_tree_id']);

        return redirect()->route('family-tree.show', $mergedTree->uuid)
            ->with('success', $result['message']);
    }

    /**
     * Decline a tree connection request
     */
    public function declineConnectionRequest(FamilyTreeConnection $connection)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify user is admin of the recipient tree
        if (!$this->adminRepository->isAdmin($connection->recipient_tree_id, $user->id)) {
            return response()->json(['error' => 'You must be an admin of the recipient tree to decline this request'], 403);
        }

        $this->connectionRepository->declineRequest($connection->id);

        return response()->json(['message' => 'Connection request declined']);
    }

    /**
     * Get tree connection requests (pending, sent, accepted)
     */
    public function getConnectionRequests(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify user is admin of the tree
        if (!$this->adminRepository->isAdmin($familyTree->id, $user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $pending = $this->connectionRepository->getPendingRequests($familyTree->id);
        $sent = $this->connectionRepository->getSentRequests($familyTree->id);
        $accepted = $this->connectionRepository->getAcceptedConnections($familyTree->id);

        return response()->json([
            'pending' => $pending,
            'sent' => $sent,
            'accepted' => $accepted,
        ]);
    }

    /**
     * Get all admins for a tree
     */
    public function getAdmins(FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Check access
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);

        if (!$isAdmin && !$isMember && !$familyTree->is_public) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $admins = $this->adminRepository->getTreeAdmins($familyTree->id);

        return response()->json(['admins' => $admins]);
    }
}
