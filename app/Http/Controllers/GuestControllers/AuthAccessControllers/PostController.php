<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\PostService;
use App\Actions\GuestServices\NotificationService;
use App\Http\Requests\GuestRequests\AuthAccessRequests\CreatePostRequest;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class PostController extends Controller
{
    public function __construct(
        private PostService $postService,
        private UserConnectionRepository $connectionRepository,
        private NotificationService $notificationService,
    ) {}

    // Note: index() method removed - "My Stories" functionality moved to Feed page "My Stories" tab

    /**
     * Display another user's stories
     */
    public function viewUser(int $userId)
    {
        $viewer = auth()->user();
        $targetUser = \App\Models\GuestModels\User::findOrFail($userId)->load('familyInfo');

        // Note: Stories now have per-story privacy settings, so we allow access to the page
        // Individual stories will be filtered based on their privacy settings

        // Format user data for display
        $userData = [
            'id' => $targetUser->id,
            'first_name' => $targetUser->first_name,
            'last_name' => $targetUser->last_name,
            'name' => trim(($targetUser->first_name ?? '') . ' ' . ($targetUser->last_name ?? '')),
            'username' => $targetUser->username,
            'email' => $targetUser->email,
            'phone' => $targetUser->phone,
            'address' => $targetUser->address,
            'bio' => $targetUser->bio,
            'date_of_birth' => $targetUser->date_of_birth,
            'profile_image_url' => $targetUser->profile_image_url,
            'status' => $targetUser->status,
            'job_title' => $targetUser->familyInfo?->current_occupation ?? null,
            'education' => $targetUser->familyInfo?->education_level ?? null,
            'created_at' => $targetUser->created_at,
        ];

        $posts = $this->postService->getUserPosts($userId, 20);
        $stats = $this->postService->getEngagementStats($userId);
        $topPosts = $this->postService->getTopEngagedPosts($userId, 5);

        // Get user connections
        $connections = $this->connectionRepository->getConnections($userId);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($userId);
        $sentRequests = $this->connectionRepository->getSentRequests($userId);

        // Get relationship context from the profile privacy service
        $privacyService = new \App\Actions\GuestServices\ProfilePrivacyService(
            new \App\Repositories\GuestRepositories\ProfilePrivacyRepository(),
            $this->connectionRepository
        );
        $relationshipContext = $privacyService->getRelationshipContext($viewer->id, $userId);

        // Check if connected and get relationship type
        $connectionStatus = null;
        $relationshipType = null;
        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $relationshipType = $this->connectionRepository->getRelationshipFromViewerPerspective($viewer->id, $userId);
            if ($relationshipType) {
                $connectionStatus = 'connected';
            }
        }

        // Check for pending/sent requests
        $pendingRequest = null;
        $sentRequest = null;
        if ($connectionStatus !== 'connected') {
            $pendingRequest = $this->connectionRepository->getPendingRequestBetween($viewer->id, $userId);
            $sentRequest = $this->connectionRepository->getSentRequestBetween($viewer->id, $userId);
        }

        // Get mutual connections
        $mutualConnections = [];
        if ($relationshipContext === 'connected' || $relationshipContext === 'nuclear_family') {
            $mutualConnections = $this->connectionRepository->getMutualConnections($viewer->id, $userId);
        }

        return Inertia::render('GuestPages/AuthAccessPages/Stories/ViewUserStories', [
            'user' => $userData,
            'userId' => $userId,
            'posts' => $posts,
            'postCount' => count($posts),
            'stats' => $stats,
            'topPosts' => $topPosts,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => 0,
            'mutualConnectionsCount' => count($mutualConnections),
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
     * Store a new post
     */
    public function store(CreatePostRequest $request)
    {
        try {
            $user = auth()->user();

            $validated = $request->validated();

            $post = $this->postService->createPost($user, $validated);

            return back()->with('success', 'Post created successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    // Note: show() and showOrgPost() methods moved to FeedController
    // to render within the full feed layout with sidebars

    /**
     * Update a post
     */
    public function update(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'content' => 'nullable|string|max:5000',
            ]);

            $post = $this->postService->updatePost($postId, $user, $data);

            return back()->with('success', 'Post updated successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Delete a post
     */
    public function destroy(int $postId)
    {
        try {
            $user = auth()->user();
            $this->postService->deletePost($postId, $user);

            return back()->with('success', 'Post deleted successfully!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Add a comment to a post (supports threaded replies)
     */
    public function addComment(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'content' => 'required|string|max:1000',
                'parent_comment_id' => 'nullable|integer|exists:post_comments,id',
            ]);

            $comment = $this->postService->addComment(
                $postId,
                $user,
                $data['content'],
                $data['parent_comment_id'] ?? null
            );

            return response()->json(['comment' => $comment], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a comment
     */
    public function deleteComment(int $commentId)
    {
        try {
            $user = auth()->user();
            $this->postService->deleteComment($commentId, $user);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle like on a post comment
     */
    public function toggleCommentLike(int $commentId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleCommentLike($commentId, $user);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle like on an org post comment
     */
    public function toggleOrgCommentLike(int $commentId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleOrgCommentLike($commentId, $user);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Show a shareable comment thread page
     */
    public function showCommentThread(string $uuid)
    {
        try {
            $user = auth()->user();
            $thread = $this->postService->getCommentThread($uuid, $user->id);

            if (!$thread) {
                return redirect('/')->with('error', 'Comment not found');
            }

            return Inertia::render('GuestPages/AuthAccessPages/Stories/ShowCommentThread', [
                'thread' => $thread,
            ]);
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Comment not found');
        }
    }

    /**
     * Toggle refam on a regular post
     */
    public function toggleRefam(int $postId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleRefam($postId, $user, false);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle refam on an org post
     */
    public function toggleOrgRefam(int $orgPostId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleRefam($orgPostId, $user, true);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle save on a regular post
     */
    public function toggleSave(int $postId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleSave($postId, $user, false);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Toggle save on an org post
     */
    public function toggleOrgSave(int $orgPostId)
    {
        try {
            $user = auth()->user();
            $result = $this->postService->toggleSave($orgPostId, $user, true);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Add a reaction to a post
     */
    public function addReaction(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'reaction_type' => 'required|in:like,love,haha,wow,sad,angry',
            ]);

            $reaction = $this->postService->addReaction($postId, $user, $data['reaction_type']);

            return response()->json(['reaction' => $reaction], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove a reaction from a post
     */
    public function removeReaction(int $postId)
    {
        try {
            $user = auth()->user();
            $this->postService->removeReaction($postId, $user);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Add a reaction to an org post
     */
    public function addOrgReaction(int $orgPostId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'reaction_type' => 'required|in:like,love,haha,wow,sad,angry',
            ]);

            $orgPost = \App\Models\OrgModels\OrgPost::findOrFail($orgPostId);

            $reaction = \App\Models\OrgModels\OrgPostReaction::updateOrCreate(
                ['org_post_id' => $orgPost->id, 'user_id' => $user->id],
                ['reaction_type' => $data['reaction_type']]
            );

            // Update reactions count
            $orgPost->update(['reactions_count' => $orgPost->reactions()->count()]);

            return response()->json(['reaction' => $reaction], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Remove a reaction from an org post
     */
    public function removeOrgReaction(int $orgPostId)
    {
        try {
            $user = auth()->user();
            $orgPost = \App\Models\OrgModels\OrgPost::findOrFail($orgPostId);

            \App\Models\OrgModels\OrgPostReaction::where('org_post_id', $orgPost->id)
                ->where('user_id', $user->id)
                ->delete();

            // Update reactions count
            $orgPost->update(['reactions_count' => $orgPost->reactions()->count()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Add a comment to an org post (supports threaded replies)
     */
    public function addOrgComment(int $orgPostId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'content' => 'required|string|max:1000',
                'parent_comment_id' => 'nullable|integer|exists:org_post_comments,id',
            ]);

            $orgPost = \App\Models\OrgModels\OrgPost::findOrFail($orgPostId);

            // Flatten: if parent is itself a reply, use its parent instead (max 2 levels)
            $parentId = $data['parent_comment_id'] ?? null;
            if ($parentId) {
                $parent = \App\Models\OrgModels\OrgPostComment::find($parentId);
                if ($parent && $parent->parent_comment_id) {
                    $parentId = $parent->parent_comment_id;
                }
            }

            $comment = \App\Models\OrgModels\OrgPostComment::create([
                'org_post_id' => $orgPost->id,
                'user_id' => $user->id,
                'content' => $data['content'],
                'parent_comment_id' => $parentId,
            ]);

            // Update comments count
            $orgPost->update(['comments_count' => $orgPost->comments()->count()]);

            return response()->json(['comment' => $comment->load('user')], 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Delete a comment from an org post
     */
    public function deleteOrgComment(int $commentId)
    {
        try {
            $user = auth()->user();
            $comment = \App\Models\OrgModels\OrgPostComment::findOrFail($commentId);

            if ($comment->user_id !== $user->id) {
                return response()->json(['error' => 'Unauthorized'], 403);
            }

            $orgPost = $comment->orgPost;
            $comment->delete();

            // Update comments count
            $orgPost->update(['comments_count' => $orgPost->comments()->count()]);

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Search posts
     */
    public function search()
    {
        try {
            $user = auth()->user();
            $query = request()->input('q', '');

            if (strlen($query) < 2) {
                return response()->json(['posts' => []]);
            }

            $posts = $this->postService->searchPosts($user->id, $query);

            return response()->json(['posts' => $posts]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Filter posts by type
     */
    public function filterByType()
    {
        try {
            $user = auth()->user();
            $type = request()->input('type', 'text');

            if (!in_array($type, ['text', 'voice'])) {
                return response()->json(['error' => 'Invalid type'], 400);
            }

            $posts = $this->postService->filterPostsByType($user->id, $type);

            return response()->json(['posts' => $posts]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Check if a viewer can access the target user's content based on visibility settings
     */
    private function canViewContent($viewer, $targetUser, string $contentType): bool
    {
        // Users can always view their own content
        if ($viewer->id === $targetUser->id) {
            return true;
        }

        $visibilityField = $contentType === 'stories' ? 'stories_visibility' : 'galleries_visibility';
        $visibility = $targetUser->{$visibilityField} ?? 'connected';

        return match ($visibility) {
            'public' => true,
            'connected' => $this->isConnectedDirect($viewer, $targetUser),
            'private' => false,
            default => false,
        };
    }

    /**
     * Check if two users are directly connected
     */
    private function isConnectedDirect($viewer, $targetUser): bool
    {
        $viewerConnections = $this->connectionRepository->getConnections($viewer->id);

        foreach ($viewerConnections as $connection) {
            $connectedUserId = $connection->requester_user_id === $viewer->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            if ($connectedUserId === $targetUser->id) {
                return true;
            }
        }

        return false;
    }
}
