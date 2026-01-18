<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\PostService;
use App\Actions\GuestServices\NotificationService;
use App\Actions\GuestServices\UserFollowService;
use App\Actions\GuestServices\AuthAccessServices\ConnectionFeedsService;
use App\Actions\GuestServices\AuthAccessServices\ProfileCompletionService;
use App\Actions\GuestServices\AuthAccessServices\SuggestedConnectionService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\PostRepository;
use App\Repositories\GuestRepositories\FamilyTreeRepository;

class FeedController extends Controller
{
    public function __construct(
        private PostService $postService,
        private ConnectionFeedsService $connectionFeedsService,
        private NotificationService $notificationService,
        private UserConnectionRepository $connectionRepository,
        private UserFollowService $followService,
        private PostRepository $postRepository,
        private ProfileCompletionService $profileCompletionService,
        private FamilyTreeRepository $familyTreeRepository,
        private SuggestedConnectionService $suggestedConnectionService,
    ) {}

    /**
     * Display the main social media feed for authenticated users
     * Features tabs for: Following, Connections, General posts
     * Includes sidebars for notifications and trending posts
     */
    public function index()
    {
        $user = auth()->user()->load('familyInfo');

        if (!$user) {
            return redirect()->route('home');
        }

        // Get user's connections for sidebar
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);

        // Get notifications
        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);
        $recentNotifications = $this->notificationService->getNotificationsWithRelations($user->id, 10);

        // Get posts from followed users
        $followingList = $this->followService->getFollowingList($user->id, $user->id);
        $followingIds = collect($followingList)->pluck('id')->toArray();
        $followingPosts = !empty($followingIds) ? $this->getPostsFromFollowedUsers($followingIds, $user->id) : [];

        // Get posts from connections
        $connectionPosts = $this->connectionFeedsService->getConnectionFeeds($user);

        // Get general public posts (from everyone) - using connection posts for now
        $generalPosts = $connectionPosts;

        // Get user's own posts for "My Stories" tab
        $myPosts = $this->postService->getUserPosts($user->id, 50);

        // Get trending posts for right sidebar
        $trendingPosts = $this->connectionFeedsService->getTopTrendingPosts($user, 10);

        // Get suggested connections
        $suggestedData = $this->suggestedConnectionService->getSuggestedMembers($user->id);
        $suggestedUsers = $suggestedData['suggestions'] ?? [];

        // Get following/followers count
        $followingCount = collect($followingList)->count();
        $followersList = $this->followService->getFollowersList($user->id, $user->id);
        $followersCount = collect($followersList)->count();

        // Get non-mutual followers (followers who I'm NOT following back)
        $followersIds = collect($followersList)->pluck('id')->toArray();
        $nonMutualFollowerIds = array_diff($followersIds, $followingIds);
        $followersPosts = !empty($nonMutualFollowerIds) ? $this->getPostsFromFollowedUsers($nonMutualFollowerIds, $user->id) : [];

        // Format user data
        $userData = [
            'id' => $user->id,
            'uuid' => $user->uuid,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => trim($user->first_name . ' ' . $user->last_name),
            'username' => $user->username,
            'email' => $user->email,
            'profile_image_url' => $user->profile_image_url,
            'bio' => $user->bio,
        ];

        // Get feed stats
        $stats = [
            'connections' => $connectionCount,
            'following' => $followingCount,
            'followers' => $followersCount,
        ];

        // Get profile completion data
        $profileCompletion = $this->profileCompletionService->getProfileCompletion($user);

        // Get all public posts except the logged-in user's own posts
        $allPublicPosts = \App\Models\GuestModels\Post::where('user_id', '!=', $user->id)
            ->where(function ($query) {
                $query->where('privacy', 'public')
                      ->orWhereNull('privacy'); // Include posts where privacy is not set (default to public)
            })
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) use ($user) {
                return $this->formatPost($post, $user->id);
            })
            ->toArray();

        // Get user's family trees for chat (trees where user is a member)
        $userTrees = $this->familyTreeRepository->getUserMemberTrees($user->id);
        $firstTree = $userTrees->first();
        $treeForChat = $firstTree ? [
            'id' => $firstTree->uuid,  // Use UUID instead of numeric ID for route binding
            'tree_name' => $firstTree->tree_name,
        ] : null;

        return Inertia::render('GuestPages/AuthAccessPages/Feed/Index', [
            'user' => $userData,
            'stats' => $stats,
            'followingPosts' => $followingPosts,
            'connectionPosts' => $connectionPosts,
            'generalPosts' => $generalPosts,
            'followersPosts' => $followersPosts,
            'allPosts' => $allPublicPosts,
            'myPosts' => $myPosts,
            'trendingPosts' => $trendingPosts,
            'recentNotifications' => $recentNotifications,
            'suggestedUsers' => $suggestedUsers,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
            'profileCompletion' => $profileCompletion,
            'treeForChat' => $treeForChat,
        ]);
    }

    /**
     * Get posts from followed users
     * Helper method to fetch posts from a list of user IDs
     */
    private function getPostsFromFollowedUsers(array $userIds, int $viewerId): array
    {
        if (empty($userIds)) {
            return [];
        }

        $posts = \App\Models\GuestModels\Post::whereIn('user_id', $userIds)
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get();

        // Format posts similar to PostService
        return $posts->map(function ($post) use ($viewerId) {
            return $this->formatPost($post, $viewerId);
        })->toArray();
    }

    /**
     * Format a single post for response
     */
    private function formatPost($post, $currentUserId = null): array
    {
        $userReaction = null;
        if ($currentUserId) {
            $reaction = \App\Models\GuestModels\PostReaction::where('post_id', $post->id)
                ->where('user_id', $currentUserId)
                ->first();
            $userReaction = $reaction ? $reaction->reaction_type : null;
        }

        return [
            'id' => $post->id,
            'type' => $post->type,
            'title' => $post->title,
            'content' => $post->content,
            'voice_url' => $post->voice_url,
            'voice_duration' => $post->voice_duration,
            'views_count' => $post->views_count,
            'comments_count' => $post->comments_count,
            'reactions_count' => $post->reactions_count,
            'user_reaction' => $userReaction,
            'images' => $post->images->map(function($img) {
                // Fix double storage path issue: /storage/storage/ -> /storage/
                $rawUrl = $img->getAttributes()['image_url'] ?? '';
                $fixedUrl = str_replace('/storage/storage/', '/storage/', $rawUrl);

                return [
                    'id' => $img->id,
                    'url' => $fixedUrl,
                    'order' => $img->order,
                ];
            })->toArray(),
            'comments' => $post->comments->map(fn($comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'user' => [
                    'id' => $comment->user->id,
                    'name' => trim($comment->user->first_name . ' ' . $comment->user->last_name),
                    'username' => $comment->user->username,
                    'profile_image_url' => $comment->user->profile_image_url,
                ],
                'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
                'created_at_human' => $comment->created_at->diffForHumans(),
            ])->toArray(),
            'user' => [
                'id' => $post->user->id,
                'name' => trim($post->user->first_name . ' ' . $post->user->last_name),
                'username' => $post->user->username,
                'profile_image_url' => $post->user->profile_image_url,
            ],
            'created_at' => $post->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $post->created_at->diffForHumans(),
        ];
    }

    /**
     * API: Get paginated posts from followed users
     */
    public function getFollowingPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // Get following list
        $followingList = $this->followService->getFollowingList($user->id, $user->id);
        $followingIds = collect($followingList)->pluck('id')->toArray();

        if (empty($followingIds)) {
            return response()->json([
                'posts' => [],
                'hasMore' => false,
            ]);
        }

        // Get posts with pagination
        $posts = \App\Models\GuestModels\Post::whereIn('user_id', $followingIds)
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit + 1) // Fetch one extra to check if there are more
            ->get();

        $hasMore = $posts->count() > $limit;
        if ($hasMore) {
            $posts = $posts->slice(0, $limit);
        }

        $formattedPosts = $posts->map(function ($post) use ($user) {
            return $this->formatPost($post, $user->id);
        })->values()->toArray();

        return response()->json([
            'posts' => $formattedPosts,
            'hasMore' => $hasMore,
        ]);
    }

    /**
     * API: Get paginated posts from connections
     */
    public function getConnectionPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // Get connection posts with pagination
        $connectionPosts = $this->connectionFeedsService->getConnectionFeeds($user, $limit, $offset);

        // Since connectionFeedsService may already return formatted posts, check if we need more posts
        $hasMore = count($connectionPosts) >= $limit;

        return response()->json([
            'posts' => $connectionPosts,
            'hasMore' => $hasMore,
        ]);
    }

    /**
     * API: Get paginated general posts
     */
    public function getGeneralPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // For now, use connection posts as general posts
        return $this->getConnectionPosts($request);
    }

    /**
     * API: Get paginated posts from non-mutual followers
     * (followers who I'm NOT following back)
     */
    public function getFollowersPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // Get followers list (users who follow me)
        $followersList = $this->followService->getFollowersList($user->id, $user->id);
        $followerIds = collect($followersList)->pluck('id')->toArray();

        // Get following list (users I follow)
        $followingList = $this->followService->getFollowingList($user->id, $user->id);
        $followingIds = collect($followingList)->pluck('id')->toArray();

        // Get non-mutual followers (followers who I'm NOT following back)
        $nonMutualFollowerIds = array_diff($followerIds, $followingIds);

        if (empty($nonMutualFollowerIds)) {
            return response()->json([
                'posts' => [],
                'hasMore' => false,
            ]);
        }

        // Get posts with pagination from non-mutual followers only
        $posts = \App\Models\GuestModels\Post::whereIn('user_id', $nonMutualFollowerIds)
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit + 1)
            ->get();

        $hasMore = $posts->count() > $limit;
        if ($hasMore) {
            $posts = $posts->slice(0, $limit);
        }

        $formattedPosts = $posts->map(function ($post) use ($user) {
            return $this->formatPost($post, $user->id);
        })->values()->toArray();

        return response()->json([
            'posts' => $formattedPosts,
            'hasMore' => $hasMore,
        ]);
    }

    /**
     * API: Get all public posts (excluding logged-in user's own posts)
     */
    public function getAllPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // Get all public posts from all users except the logged-in user
        $posts = \App\Models\GuestModels\Post::where('user_id', '!=', $user->id)
            ->where(function ($query) {
                $query->where('privacy', 'public')
                      ->orWhereNull('privacy'); // Include posts where privacy is not set (default to public)
            })
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit + 1)
            ->get();

        $hasMore = $posts->count() > $limit;
        if ($hasMore) {
            $posts = $posts->slice(0, $limit);
        }

        $formattedPosts = $posts->map(function ($post) use ($user) {
            return $this->formatPost($post, $user->id);
        })->values()->toArray();

        return response()->json([
            'posts' => $formattedPosts,
            'hasMore' => $hasMore,
        ]);
    }

    /**
     * API: Get paginated user's own posts
     */
    public function getMyPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        // Get user's own posts with pagination
        $posts = \App\Models\GuestModels\Post::where('user_id', $user->id)
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->offset($offset)
            ->limit($limit + 1)
            ->get();

        $hasMore = $posts->count() > $limit;
        if ($hasMore) {
            $posts = $posts->slice(0, $limit);
        }

        $formattedPosts = $posts->map(function ($post) use ($user) {
            return $this->formatPost($post, $user->id);
        })->values()->toArray();

        return response()->json([
            'posts' => $formattedPosts,
            'hasMore' => $hasMore,
        ]);
    }
}
