<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeService;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeValidationService;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeMergeService;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeConnectionRepository;
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
        private FamilyTreeMergeService $mergeService
    ) {}

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

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/Index', [
            'adminTrees' => $adminTrees->map(fn($tree) => [
                'id' => $tree->id,
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
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'is_nuclear_family' => $tree->is_nuclear_family ?? false,
                'member_count' => $this->treeRepository->getMemberCount($tree->id),
                'created_by' => [
                    'id' => $tree->createdBy->id,
                    'name' => trim($tree->createdBy->first_name . ' ' . $tree->createdBy->last_name),
                ],
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
                        'role' => $member['role'],
                    ];
                }
            }
        }

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/CreateTree', [
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

        return redirect()->route('family-tree.show', $result['tree']->id)
            ->with('success', "Nuclear family tree created successfully! {$result['members_added']} members added.");
    }

    /**
     * Show a family tree
     */
    public function show(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        $tree = $this->treeRepository->getTree($treeId);

        // Check access (admin or member)
        $isAdmin = $this->adminRepository->isAdmin($treeId, $user->id);
        $isMember = $this->treeRepository->isMember($treeId, $user->id);

        if (!$isAdmin && !$isMember && !$tree->is_public) {
            abort(403, 'Unauthorized to view this family tree');
        }

        // Get tree admins and members
        $admins = $this->adminRepository->getTreeAdmins($treeId);
        $members = $this->treeRepository->getTreeMembers($treeId);

        // Get pending tree connection requests if admin
        $pendingRequests = $isAdmin ? $this->connectionRepository->getPendingRequests($treeId) : collect();
        $sentRequests = $isAdmin ? $this->connectionRepository->getSentRequests($treeId) : collect();

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/MyFamilyTree', [
            'tree' => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'is_nuclear_family' => $tree->is_nuclear_family,
                'created_at' => $tree->created_at,
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
                'nuclear_family_role' => $member->nuclear_family_role,
                'can_add_members' => $member->can_add_members,
                'added_at' => $member->added_at,
            ]),
            'pendingRequests' => $pendingRequests,
            'sentRequests' => $sentRequests,
            'isAdmin' => $isAdmin,
            'isMember' => $isMember,
            'canAddMembers' => $this->treeService->canAddMembers($treeId, $user->id),
        ]);
    }

    /**
     * Show edit family tree form
     */
    public function edit(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($treeId, $user->id)) {
            abort(403, 'Unauthorized to edit this family tree');
        }

        $tree = $this->treeRepository->getTree($treeId);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/EditTree', [
            'tree' => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
            ],
        ]);
    }

    /**
     * Update a family tree
     */
    public function update(Request $request, int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($treeId, $user->id)) {
            abort(403, 'Unauthorized to update this family tree');
        }

        $validated = $request->validate([
            'tree_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
        ]);

        $this->treeRepository->update($treeId, [
            'tree_name' => $validated['tree_name'],
            'description' => $validated['description'] ?? null,
            'is_public' => $validated['is_public'] ?? false,
        ]);

        return redirect()->route('family-tree.show', $treeId)
            ->with('success', 'Family tree updated successfully!');
    }

    /**
     * Add a nuclear family member to the tree
     */
    public function addMember(Request $request, int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $result = $this->treeService->addNuclearFamilyMember($treeId, $validated['user_id'], $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 400);
        }

        return response()->json(['message' => $result['message']]);
    }

    /**
     * Remove a member from family tree
     */
    public function removeMember(Request $request, int $treeId, int $userId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        if (!$this->adminRepository->isAdmin($treeId, $user->id)) {
            return response()->json(['error' => 'Unauthorized to modify this family tree'], 403);
        }

        $this->treeRepository->removeMember($treeId, $userId);

        return response()->json(['message' => 'Member removed successfully']);
    }

    /**
     * Delete a family tree
     */
    public function destroy(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        if (!$this->adminRepository->isAdmin($treeId, $user->id)) {
            abort(403, 'Unauthorized to delete this family tree');
        }

        $this->treeRepository->delete($treeId);

        return redirect()->route('family-tree.index')
            ->with('success', 'Family tree deleted successfully!');
    }

    /**
     * Get tree data as JSON (admins and members)
     */
    public function getTreeData(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tree = $this->treeRepository->getTree($treeId);

        // Check access
        $isAdmin = $this->adminRepository->isAdmin($treeId, $user->id);
        $isMember = $this->treeRepository->isMember($treeId, $user->id);

        if (!$isAdmin && !$isMember && !$tree->is_public) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $admins = $this->adminRepository->getTreeAdmins($treeId);
        $members = $this->treeRepository->getTreeMembers($treeId);

        return response()->json([
            'tree' => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'is_nuclear_family' => $tree->is_nuclear_family,
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
            'my_tree_id' => 'required|integer|exists:family_trees,id',
            'target_tree_id' => 'required|integer|exists:family_trees,id',
            'message' => 'nullable|string|max:500',
        ]);

        // Verify user is admin of their tree
        if (!$this->adminRepository->isAdmin($validated['my_tree_id'], $user->id)) {
            return response()->json(['error' => 'You must be an admin of your family tree to send connection requests'], 403);
        }

        // Check if connection already exists
        if ($this->connectionRepository->connectionExists($validated['my_tree_id'], $validated['target_tree_id'])) {
            return response()->json(['error' => 'A connection request already exists between these trees'], 400);
        }

        $connection = $this->connectionRepository->sendRequest(
            $validated['my_tree_id'],
            $validated['target_tree_id'],
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
    public function acceptConnectionRequest(int $connectionId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $connection = $this->connectionRepository->find($connectionId);

        // Verify user is admin of the recipient tree
        if (!$this->adminRepository->isAdmin($connection->recipient_tree_id, $user->id)) {
            return response()->json(['error' => 'You must be an admin of the recipient tree to accept this request'], 403);
        }

        // Merge the trees
        $result = $this->mergeService->mergeTrees($connectionId, $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['message']], 400);
        }

        return redirect()->route('family-tree.show', $result['merged_tree_id'])
            ->with('success', $result['message']);
    }

    /**
     * Decline a tree connection request
     */
    public function declineConnectionRequest(int $connectionId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $connection = $this->connectionRepository->find($connectionId);

        // Verify user is admin of the recipient tree
        if (!$this->adminRepository->isAdmin($connection->recipient_tree_id, $user->id)) {
            return response()->json(['error' => 'You must be an admin of the recipient tree to decline this request'], 403);
        }

        $this->connectionRepository->declineRequest($connectionId);

        return response()->json(['message' => 'Connection request declined']);
    }

    /**
     * Get tree connection requests (pending, sent, accepted)
     */
    public function getConnectionRequests(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify user is admin of the tree
        if (!$this->adminRepository->isAdmin($treeId, $user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $pending = $this->connectionRepository->getPendingRequests($treeId);
        $sent = $this->connectionRepository->getSentRequests($treeId);
        $accepted = $this->connectionRepository->getAcceptedConnections($treeId);

        return response()->json([
            'pending' => $pending,
            'sent' => $sent,
            'accepted' => $accepted,
        ]);
    }

    /**
     * Get all admins for a tree
     */
    public function getAdmins(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tree = $this->treeRepository->getTree($treeId);

        // Check access
        $isAdmin = $this->adminRepository->isAdmin($treeId, $user->id);
        $isMember = $this->treeRepository->isMember($treeId, $user->id);

        if (!$isAdmin && !$isMember && !$tree->is_public) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $admins = $this->adminRepository->getTreeAdmins($treeId);

        return response()->json(['admins' => $admins]);
    }
}
