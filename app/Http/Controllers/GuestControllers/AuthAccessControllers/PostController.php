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

    /**
     * Display My Stories page
     */
    public function index()
    {
        $user = auth()->user()->load('familyInfo');

        if (!$user) {
            return redirect()->route('home');
        }

        // Get user's connections and pending requests
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);
        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);

        // Format user data
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'created_at' => $user->created_at,
        ];

        $posts = $this->postService->getUserPosts($user->id, 20);
        $stats = $this->postService->getEngagementStats($user->id);
        $topPosts = $this->postService->getTopEngagedPosts($user->id, 5);

        return Inertia::render('GuestPages/AuthAccessPages/Stories/MyStories', [
            'user' => $userData,
            'posts' => $posts,
            'postCount' => count($posts),
            'stats' => $stats,
            'topPosts' => $topPosts,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
        ]);
    }

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

    /**
     * Display a single post
     */
    public function show(int $postId)
    {
        try {
            $post = $this->postService->getPost($postId);
            $comments = $this->postService->getPostComments($postId);
            $reactions = $this->postService->getPostReactions($postId);

            return Inertia::render('GuestPages/AuthAccessPages/Stories/ShowPost', [
                'post' => $post,
                'comments' => $comments,
                'reactions' => $reactions,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Post not found']);
        }
    }

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
     * Add a comment to a post
     */
    public function addComment(int $postId)
    {
        try {
            $user = auth()->user();
            $data = request()->validate([
                'content' => 'required|string|max:1000',
            ]);

            $comment = $this->postService->addComment($postId, $user, $data['content']);

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
