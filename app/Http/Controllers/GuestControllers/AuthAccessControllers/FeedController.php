<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\PostService;
use App\Actions\GuestServices\NotificationService;
use App\Actions\GuestServices\UserFollowService;
use App\Actions\GuestServices\AuthAccessServices\ConnectionFeedsService;
use App\Actions\GuestServices\AuthAccessServices\ProfileCompletionService;
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

        // Get trending posts for right sidebar
        $trendingPosts = $this->connectionFeedsService->getTopTrendingPosts($user, 10);

        // Get suggested connections - empty for now
        $suggestedUsers = [];

        // Get following/followers count
        $followingCount = collect($followingList)->count();
        $followersList = $this->followService->getFollowersList($user->id, $user->id);
        $followersCount = collect($followersList)->count();

        // Format user data
        $userData = [
            'id' => $user->id,
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
            'posts' => $this->postRepository->getUserPostsCount($user->id),
        ];

        // Get profile completion data
        $profileCompletion = $this->profileCompletionService->getProfileCompletion($user);

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
}
