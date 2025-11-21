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
        $targetUser = \App\Models\GuestModels\User::findOrFail($userId);

        $posts = $this->postService->getUserPosts($userId, 20);
        $userName = trim(($targetUser->first_name ?? '') . ' ' . ($targetUser->last_name ?? ''));

        return Inertia::render('GuestPages/AuthAccessPages/Stories/ViewUserStories', [
            'userName' => $userName,
            'userId' => $userId,
            'posts' => $posts,
            'postCount' => count($posts),
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
                'title' => 'nullable|string|max:255',
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
}
