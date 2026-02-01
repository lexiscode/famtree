<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Actions\GuestServices\AuthAccessServices\TreeChatService;
use App\Http\Controllers\Controller;
use App\Models\GuestModels\FamilyTree;
use App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use Illuminate\Http\Request;

class TreeChatController extends Controller
{
    public function __construct(
        private TreeChatService $chatService,
        private FamilyTreeRepository $treeRepository,
        private FamilyTreeAdminRepository $adminRepository
    ) {}

    /**
     * Get chat messages for a family tree
     */
    public function getMessages(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Check if user is a member or admin of the tree
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);

        if (!$isMember && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $this->chatService->getMessages($familyTree->id, 100);

        // Mark messages as read when user fetches them
        $this->chatService->markAsRead($familyTree->id, $user->id);

        return response()->json([
            'messages' => $messages,
        ]);
    }

    /**
     * Send a new chat message
     */
    public function sendMessage(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Check if user is a member or admin of the tree
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);

        if (!$isMember && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $result = $this->chatService->sendMessage($familyTree->id, $user->id, $validated['message']);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'message' => $result['message'],
        ]);
    }

    /**
     * Broadcast typing indicator
     */
    public function typing(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Check if user is a member or admin of the tree
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);

        if (!$isMember && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $this->chatService->broadcastTyping($familyTree->id, $user, $validated['is_typing']);

        return response()->json(['success' => true]);
    }

    /**
     * Mark messages as read
     */
    public function markAsRead(Request $request, FamilyTree $familyTree)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Check if user is a member or admin of the tree
        $isMember = $this->treeRepository->isMember($familyTree->id, $user->id);
        $isAdmin = $this->adminRepository->isAdmin($familyTree->id, $user->id);

        if (!$isMember && !$isAdmin) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->chatService->markAsRead($familyTree->id, $user->id);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * Edit a message
     */
    public function editMessage(Request $request, int $messageId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $result = $this->chatService->editMessage($messageId, $user->id, $validated['message']);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
        ]);
    }

    /**
     * Delete a message
     */
    public function deleteMessage(int $messageId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $result = $this->chatService->deleteMessage($messageId, $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Bulk delete messages
     */
    public function bulkDeleteMessages(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer',
        ]);

        $result = $this->chatService->bulkDeleteMessages($validated['message_ids'], $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $result['deleted_count'],
        ]);
    }
}
