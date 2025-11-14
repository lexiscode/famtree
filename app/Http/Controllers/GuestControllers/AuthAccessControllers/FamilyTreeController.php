<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\FamilyTreeService;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FamilyTreeController extends Controller
{
    public function __construct(
        private FamilyTreeService $treeService,
        private FamilyTreeRepository $treeRepository,
    ) {}

    /**
     * Display user's family trees
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        // Get trees created by user
        $myTrees = $this->treeRepository->getUserTrees($user->id);

        // Get trees user is a member of
        $memberTrees = $this->treeRepository->getUserMemberTrees($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/Index', [
            'myTrees' => $myTrees->map(fn($tree) => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'member_count' => $this->treeRepository->getMemberCount($tree->id),
                'created_at' => $tree->created_at,
            ]),
            'memberTrees' => $memberTrees->map(fn($tree) => [
                'id' => $tree->id,
                'name' => $tree->tree_name,
                'description' => $tree->description,
                'is_public' => $tree->is_public,
                'member_count' => $this->treeRepository->getMemberCount($tree->id),
                'created_by' => [
                    'id' => $tree->createdBy->id,
                    'name' => $tree->createdBy->name,
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
            return redirect()->route('login');
        }

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/CreateTree', [
            'connectionCount' => \DB::table('user_connections')
                ->where('status', 'accepted')
                ->where(function ($q) use ($user) {
                    $q->where('requester_user_id', $user->id)
                      ->orWhere('recipient_user_id', $user->id);
                })
                ->count(),
        ]);
    }

    /**
     * Store a new family tree
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $validated = $request->validate([
            'tree_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'boolean',
            'auto_populate' => 'boolean',
        ]);

        // Create the family tree
        $tree = $this->treeService->createFromConnections(
            $user->id,
            $validated['tree_name'],
            $validated['description'] ?? null,
            $validated['is_public'] ?? false
        );

        // Auto-populate with user's connections if requested
        if ($validated['auto_populate'] ?? false) {
            $this->treeService->addUserConnections($tree->id, $user->id);
        }

        return redirect()->route('family-tree.show', $tree->id)
            ->with('success', 'Family tree created successfully!');
    }

    /**
     * Show a family tree
     */
    public function show(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        $tree = $this->treeRepository->getTree($treeId);

        // Check access (owner or member)
        $isOwner = $this->treeService->isOwner($treeId, $user->id);
        $isMember = $this->treeRepository->isMember($treeId, $user->id);

        if (!$isOwner && !$isMember && !$tree->is_public) {
            abort(403, 'Unauthorized to view this family tree');
        }

        // Get visualization data
        $treeData = $this->treeService->getTreeVisualization($treeId);
        $stats = $this->treeService->getTreeStats($treeId);

        return Inertia::render('GuestPages/AuthAccessPages/FamilyTree/MyFamilyTree', [
            'tree' => array_merge($treeData['tree'], ['is_owner' => $isOwner]),
            'members' => $treeData['members'],
            'connections' => $treeData['connections'],
            'stats' => $stats,
            'isOwner' => $isOwner,
            'isMember' => $isMember,
        ]);
    }

    /**
     * Show edit family tree form
     */
    public function edit(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$this->treeService->isOwner($treeId, $user->id)) {
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
            return redirect()->route('login');
        }

        if (!$this->treeService->isOwner($treeId, $user->id)) {
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
     * Add a member to family tree
     */
    public function addMember(Request $request, int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$this->treeService->isOwner($treeId, $user->id)) {
            abort(403, 'Unauthorized to modify this family tree');
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $userId = $validated['user_id'];

        // Check if already a member
        if ($this->treeRepository->isMember($treeId, $userId)) {
            return response()->json(['message' => 'User is already a member of this tree'], 400);
        }

        $this->treeRepository->addMember($treeId, $userId, $user->id);

        return response()->json(['message' => 'Member added successfully']);
    }

    /**
     * Remove a member from family tree
     */
    public function removeMember(Request $request, int $treeId, int $userId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('login');
        }

        if (!$this->treeService->isOwner($treeId, $user->id)) {
            abort(403, 'Unauthorized to modify this family tree');
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
            return redirect()->route('login');
        }

        if (!$this->treeService->isOwner($treeId, $user->id)) {
            abort(403, 'Unauthorized to delete this family tree');
        }

        $this->treeRepository->delete($treeId);

        return redirect()->route('family-tree.index')
            ->with('success', 'Family tree deleted successfully!');
    }

    /**
     * Get tree data as JSON for visualization
     */
    public function getTreeData(int $treeId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $tree = $this->treeRepository->getTree($treeId);

        // Check access
        $isOwner = $this->treeService->isOwner($treeId, $user->id);
        $isMember = $this->treeRepository->isMember($treeId, $user->id);

        if (!$isOwner && !$isMember && !$tree->is_public) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $treeData = $this->treeService->getTreeVisualization($treeId);

        return response()->json($treeData);
    }
}
