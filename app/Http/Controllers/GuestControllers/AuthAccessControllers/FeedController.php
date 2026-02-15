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
use App\Actions\GuestServices\AuthAccessServices\PrivateMessageService;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\PostRepository;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\TreeChatRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Repositories\GuestRepositories\OrganizationFollowRepository;
use App\Repositories\OrgRepositories\OrgPostRepository;

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
        private PrivateMessageService $messageService,
        private TreeChatRepository $treeChatRepository,
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $classSetMessageRepository,
        private OrganizationFollowRepository $organizationFollowRepo,
        private OrgPostRepository $orgPostRepository,
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

        // Merge refammed posts from followed users into following feed
        if (!empty($followingIds)) {
            $refammedPosts = $this->getRefammedPostsFromUsers($followingIds, $user->id);
            $followingPosts = collect(array_merge($followingPosts, $refammedPosts))
                ->unique('id')
                ->sortByDesc('created_at')
                ->values()
                ->toArray();
        }

        // Get posts from followed organizations and merge into following feed
        $followedOrgIds = $this->organizationFollowRepo->getFollowedOrgIds($user->id)->toArray();
        if (!empty($followedOrgIds)) {
            $orgPosts = $this->orgPostRepository->getByOrganizationIds($followedOrgIds, 20);
            $formattedOrgPosts = $orgPosts->map(function ($post) use ($user) {
                return $this->formatOrgPost($post, $user->id);
            })->toArray();

            // Merge and sort by created_at descending
            $followingPosts = collect(array_merge($followingPosts, $formattedOrgPosts))
                ->sortByDesc('created_at')
                ->values()
                ->toArray();
        }

        // Get posts from connections
        $connectionPosts = $this->connectionFeedsService->getConnectionFeeds($user);

        // Get general public posts (from everyone) - using connection posts for now
        $generalPosts = $connectionPosts;

        // Get user's saved/bookmarked posts for "Saved" tab
        $savedPosts = $this->getSavedPostsForUser($user->id, 20);

        // Get trending posts for right sidebar
        $trendingPosts = $this->connectionFeedsService->getTopTrendingPosts($user, 10);

        // Get suggested connections
        $suggestedData = $this->suggestedConnectionService->getSuggestedMembers($user->id);
        $suggestedUsers = $suggestedData['suggestions'] ?? [];

        // Get following/followers count (users + organizations)
        $followingCount = collect($followingList)->count() + count($followedOrgIds);
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
                      ->orWhereNull('privacy');
            })
            ->with(['user', 'images', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($post) use ($user) {
                return $this->formatPost($post, $user->id);
            });

        // Include org posts in the "all" tab as well
        $allOrgPosts = \App\Models\OrgModels\OrgPost::with(['organization', 'creator', 'images', 'comments.user'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function ($post) use ($user) {
                return $this->formatOrgPost($post, $user->id);
            });

        $allPublicPosts = $allPublicPosts->concat($allOrgPosts)
            ->sortByDesc('created_at')
            ->values()
            ->take(20)
            ->toArray();

        // Get user's family trees for chat (trees where user is a member)
        $userTrees = $this->familyTreeRepository->getUserMemberTrees($user->id);
        $firstTree = $userTrees->first();
        $treeForChat = $firstTree ? [
            'id' => $firstTree->uuid,  // Use UUID instead of numeric ID for route binding
            'tree_name' => $firstTree->tree_name,
        ] : null;

        // Calculate total unread messages (DM + family tree chats + class set chats)
        $dmUnreadCount = $this->messageService->getTotalUnreadCount($user->id);
        $treeIds = $userTrees->pluck('id')->toArray();
        $groupChatUnreadCount = $this->treeChatRepository->getTotalUnreadCount($user->id, $treeIds);

        // Get unread counts for class set (organization) group chats
        $userClassSets = $this->classSetRepository->getUserClassSets($user->id);
        $classSetIds = $userClassSets->pluck('id')->toArray();
        $classSetUnreadCount = $this->classSetMessageRepository->getTotalUnreadCount($user->id, $classSetIds);

        $totalUnreadMessagesCount = $dmUnreadCount + $groupChatUnreadCount + $classSetUnreadCount;

        // Get groups joined count and my stories count
        $groupsJoinedCount = count($userClassSets);
        $myStoriesCount = \App\Models\GuestModels\Post::where('user_id', $user->id)->count();

        return Inertia::render('GuestPages/AuthAccessPages/Feed/Index', [
            'user' => $userData,
            'stats' => $stats,
            'followingPosts' => $followingPosts,
            'connectionPosts' => $connectionPosts,
            'generalPosts' => $generalPosts,
            'followersPosts' => $followersPosts,
            'allPosts' => $allPublicPosts,
            'savedPosts' => $savedPosts,
            'trendingPosts' => $trendingPosts,
            'recentNotifications' => $recentNotifications,
            'suggestedUsers' => $suggestedUsers,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
            'unreadMessagesCount' => $totalUnreadMessagesCount,
            'profileCompletion' => $profileCompletion,
            'treeForChat' => $treeForChat,
            'groupsJoinedCount' => $groupsJoinedCount,
            'myStoriesCount' => $myStoriesCount,
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
     * Get refammed posts from followed users
     */
    private function getRefammedPostsFromUsers(array $userIds, int $viewerId): array
    {
        $refams = \App\Models\GuestModels\PostRefam::whereIn('user_id', $userIds)
            ->with(['user', 'post.user', 'post.images', 'orgPost.organization', 'orgPost.creator', 'orgPost.images'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        $posts = [];
        foreach ($refams as $refam) {
            if ($refam->post_id && $refam->post) {
                $formatted = $this->formatPost($refam->post, $viewerId);
                $formatted['refammed_by'] = [
                    'name' => trim($refam->user->first_name . ' ' . $refam->user->last_name),
                    'username' => $refam->user->username,
                ];
                $formatted['created_at'] = $refam->created_at->format('Y-m-d H:i:s');
                $posts[] = $formatted;
            } elseif ($refam->org_post_id && $refam->orgPost) {
                $formatted = $this->formatOrgPost($refam->orgPost, $viewerId);
                $formatted['refammed_by'] = [
                    'name' => trim($refam->user->first_name . ' ' . $refam->user->last_name),
                    'username' => $refam->user->username,
                ];
                $formatted['created_at'] = $refam->created_at->format('Y-m-d H:i:s');
                $posts[] = $formatted;
            }
        }

        return $posts;
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

        // Get threaded comments (top-level only with replies eager-loaded)
        $threadedComments = \App\Models\GuestModels\PostComment::where('post_id', $post->id)
            ->whereNull('parent_comment_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->get();

        $userHasRefammed = false;
        $userHasSaved = false;
        if ($currentUserId) {
            $userHasRefammed = \App\Models\GuestModels\PostRefam::where('post_id', $post->id)
                ->where('user_id', $currentUserId)->exists();
            $userHasSaved = \App\Models\GuestModels\PostSave::where('post_id', $post->id)
                ->where('user_id', $currentUserId)->exists();
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
            'refams_count' => $post->refams_count ?? 0,
            'user_has_refammed' => $userHasRefammed,
            'user_has_saved' => $userHasSaved,
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
            'comments' => $threadedComments->map(fn($comment) => $this->formatThreadedComment($comment, $currentUserId))->toArray(),
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
     * Format a threaded comment with replies
     */
    private function formatThreadedComment($comment, $currentUserId = null): array
    {
        $userHasLiked = false;
        if ($currentUserId) {
            $userHasLiked = \App\Models\GuestModels\PostCommentLike::where('comment_id', $comment->id)
                ->where('user_id', $currentUserId)
                ->exists();
        }

        $formatted = [
            'id' => $comment->id,
            'uuid' => $comment->uuid,
            'content' => $comment->content,
            'parent_comment_id' => $comment->parent_comment_id,
            'likes_count' => $comment->likes_count ?? 0,
            'user_has_liked' => $userHasLiked,
            'replies_count' => $comment->replies_count ?? $comment->replies()->count(),
            'is_reply' => !is_null($comment->parent_comment_id),
            'user' => [
                'id' => $comment->user->id,
                'name' => trim($comment->user->first_name . ' ' . $comment->user->last_name),
                'username' => $comment->user->username,
                'profile_image_url' => $comment->user->profile_image_url,
            ],
            'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $comment->created_at->diffForHumans(),
        ];

        if (!$comment->parent_comment_id && $comment->relationLoaded('replies')) {
            $formatted['replies'] = $comment->replies->map(fn($reply) => $this->formatThreadedComment($reply, $currentUserId))->values()->toArray();
        } else {
            $formatted['replies'] = [];
        }

        return $formatted;
    }

    /**
     * Format a single org post for the feed
     */
    private function formatOrgPost($orgPost, $currentUserId = null): array
    {
        $org = $orgPost->organization;

        // Get user's reaction on this org post
        $userReaction = null;
        if ($currentUserId) {
            $reaction = \App\Models\OrgModels\OrgPostReaction::where('org_post_id', $orgPost->id)
                ->where('user_id', $currentUserId)
                ->first();
            $userReaction = $reaction ? $reaction->reaction_type : null;
        }

        // Get threaded comments for org post
        $threadedComments = \App\Models\OrgModels\OrgPostComment::where('org_post_id', $orgPost->id)
            ->whereNull('parent_comment_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->get();

        $userHasRefammed = false;
        $userHasSaved = false;
        if ($currentUserId) {
            $userHasRefammed = \App\Models\GuestModels\PostRefam::where('org_post_id', $orgPost->id)
                ->where('user_id', $currentUserId)->exists();
            $userHasSaved = \App\Models\GuestModels\PostSave::where('org_post_id', $orgPost->id)
                ->where('user_id', $currentUserId)->exists();
        }

        return [
            'id' => 'org_' . $orgPost->id,
            'org_post_id' => $orgPost->id,
            'uuid' => $orgPost->uuid,
            'type' => $orgPost->type,
            'title' => null,
            'content' => $orgPost->content,
            'voice_url' => $orgPost->voice_url,
            'voice_duration' => $orgPost->voice_duration,
            'views_count' => $orgPost->views_count,
            'comments_count' => $orgPost->comments_count,
            'reactions_count' => $orgPost->reactions_count,
            'refams_count' => $orgPost->refams_count ?? 0,
            'user_has_refammed' => $userHasRefammed,
            'user_has_saved' => $userHasSaved,
            'user_reaction' => $userReaction,
            'images' => $orgPost->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->full_image_url ?? $img->image_url,
                'order' => $img->order,
            ])->toArray(),
            'comments' => $threadedComments->map(fn($comment) => $this->formatOrgThreadedComment($comment, $currentUserId))->toArray(),
            'user' => [
                'id' => $org->id,
                'name' => $org->short_name ?: $org->name,
                'username' => $org->slug,
                'profile_image_url' => $org->logo_url,
                'is_organization' => true,
            ],
            'is_organization' => true,
            'created_at' => $orgPost->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $orgPost->created_at->diffForHumans(),
        ];
    }

    /**
     * Format a threaded org comment with replies
     */
    private function formatOrgThreadedComment($comment, $currentUserId = null): array
    {
        $userHasLiked = false;
        if ($currentUserId) {
            $userHasLiked = \App\Models\OrgModels\OrgPostCommentLike::where('comment_id', $comment->id)
                ->where('user_id', $currentUserId)
                ->exists();
        }

        $formatted = [
            'id' => $comment->id,
            'uuid' => $comment->uuid,
            'content' => $comment->content,
            'parent_comment_id' => $comment->parent_comment_id,
            'likes_count' => $comment->likes_count ?? 0,
            'user_has_liked' => $userHasLiked,
            'replies_count' => $comment->replies_count ?? $comment->replies()->count(),
            'is_reply' => !is_null($comment->parent_comment_id),
            'is_org_comment' => true,
            'user' => [
                'id' => $comment->user->id,
                'name' => trim($comment->user->first_name . ' ' . $comment->user->last_name),
                'username' => $comment->user->username,
                'profile_image_url' => $comment->user->profile_image_url,
            ],
            'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $comment->created_at->diffForHumans(),
        ];

        if (!$comment->parent_comment_id && $comment->relationLoaded('replies')) {
            $formatted['replies'] = $comment->replies->map(fn($reply) => $this->formatOrgThreadedComment($reply, $currentUserId))->values()->toArray();
        } else {
            $formatted['replies'] = [];
        }

        return $formatted;
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

        // Get user posts
        $userPosts = collect();
        if (!empty($followingIds)) {
            $userPosts = \App\Models\GuestModels\Post::whereIn('user_id', $followingIds)
                ->with(['user', 'images', 'comments.user'])
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($post) use ($user) {
                    return $this->formatPost($post, $user->id);
                });
        }

        // Get org posts from followed organizations
        $followedOrgIds = $this->organizationFollowRepo->getFollowedOrgIds($user->id)->toArray();
        $orgPosts = collect();
        if (!empty($followedOrgIds)) {
            $orgPosts = $this->orgPostRepository->getByOrganizationIds($followedOrgIds)
                ->map(function ($post) use ($user) {
                    return $this->formatOrgPost($post, $user->id);
                });
        }

        // Merge, sort, and paginate
        $allPosts = $userPosts->concat($orgPosts)
            ->sortByDesc('created_at')
            ->values();

        $paginatedPosts = $allPosts->slice($offset, $limit + 1);
        $hasMore = $paginatedPosts->count() > $limit;
        $formattedPosts = $paginatedPosts->take($limit)->values()->toArray();

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
     * API: Get paginated saved/bookmarked posts
     */
    public function getSavedPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user();
        $offset = $request->query('offset', 0);
        $limit = $request->query('limit', 10);

        $saves = \App\Models\GuestModels\PostSave::where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit + 1)
            ->get();

        $hasMore = $saves->count() > $limit;
        $saves = $saves->take($limit);

        $formattedPosts = [];
        foreach ($saves as $save) {
            if ($save->post_id) {
                $post = \App\Models\GuestModels\Post::with(['user', 'images', 'comments.user'])->find($save->post_id);
                if ($post) {
                    $formattedPosts[] = $this->formatPost($post, $user->id);
                }
            } elseif ($save->org_post_id) {
                $orgPost = \App\Models\OrgModels\OrgPost::with(['organization', 'creator', 'images', 'comments.user'])->find($save->org_post_id);
                if ($orgPost) {
                    $formattedPosts[] = $this->formatOrgPost($orgPost, $user->id);
                }
            }
        }

        return response()->json([
            'posts' => $formattedPosts,
            'hasMore' => $hasMore,
        ]);
    }

    /**
     * Get saved posts for initial page load
     */
    private function getSavedPostsForUser(int $userId, int $limit = 20): array
    {
        $saves = \App\Models\GuestModels\PostSave::where('user_id', $userId)
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();

        $formattedPosts = [];
        foreach ($saves as $save) {
            if ($save->post_id) {
                $post = \App\Models\GuestModels\Post::with(['user', 'images', 'comments.user'])->find($save->post_id);
                if ($post) {
                    $formattedPosts[] = $this->formatPost($post, $userId);
                }
            } elseif ($save->org_post_id) {
                $orgPost = \App\Models\OrgModels\OrgPost::with(['organization', 'creator', 'images', 'comments.user'])->find($save->org_post_id);
                if ($orgPost) {
                    $formattedPosts[] = $this->formatOrgPost($orgPost, $userId);
                }
            }
        }

        return $formattedPosts;
    }

    /**
     * Get common layout data (sidebars, user info, stats) for the feed page
     */
    private function getLayoutData($user): array
    {
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);

        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);
        $recentNotifications = $this->notificationService->getNotificationsWithRelations($user->id, 10);

        $followingList = $this->followService->getFollowingList($user->id, $user->id);
        $followingCount = collect($followingList)->count();
        $followersList = $this->followService->getFollowersList($user->id, $user->id);
        $followersCount = collect($followersList)->count();

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

        $stats = [
            'connections' => $connectionCount,
            'following' => $followingCount,
            'followers' => $followersCount,
        ];

        $trendingPosts = $this->connectionFeedsService->getTopTrendingPosts($user, 10);

        $suggestedData = $this->suggestedConnectionService->getSuggestedMembers($user->id);
        $suggestedUsers = $suggestedData['suggestions'] ?? [];

        $profileCompletion = $this->profileCompletionService->getProfileCompletion($user);

        $userTrees = $this->familyTreeRepository->getUserMemberTrees($user->id);
        $firstTree = $userTrees->first();
        $treeForChat = $firstTree ? [
            'id' => $firstTree->uuid,
            'tree_name' => $firstTree->tree_name,
        ] : null;

        $dmUnreadCount = $this->messageService->getTotalUnreadCount($user->id);
        $treeIds = $userTrees->pluck('id')->toArray();
        $groupChatUnreadCount = $this->treeChatRepository->getTotalUnreadCount($user->id, $treeIds);
        $userClassSets = $this->classSetRepository->getUserClassSets($user->id);
        $classSetIds = $userClassSets->pluck('id')->toArray();
        $classSetUnreadCount = $this->classSetMessageRepository->getTotalUnreadCount($user->id, $classSetIds);
        $totalUnreadMessagesCount = $dmUnreadCount + $groupChatUnreadCount + $classSetUnreadCount;

        $groupsJoinedCount = count($userClassSets);
        $myStoriesCount = \App\Models\GuestModels\Post::where('user_id', $user->id)->count();

        return [
            'user' => $userData,
            'stats' => $stats,
            'trendingPosts' => $trendingPosts,
            'recentNotifications' => $recentNotifications,
            'suggestedUsers' => $suggestedUsers,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
            'unreadMessagesCount' => $totalUnreadMessagesCount,
            'profileCompletion' => $profileCompletion,
            'treeForChat' => $treeForChat,
            'groupsJoinedCount' => $groupsJoinedCount,
            'myStoriesCount' => $myStoriesCount,
        ];
    }

    /**
     * Display the trending posts page with pagination
     */
    public function trendingPosts(\Illuminate\Http\Request $request)
    {
        $user = auth()->user()->load('familyInfo');

        if (!$user) {
            return redirect()->route('home');
        }

        $trendingData = $this->connectionFeedsService->getPaginatedTrendingPosts($user, 15);

        // Get sidebar data
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);
        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);

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

        return Inertia::render('GuestPages/AuthAccessPages/Feed/TrendingPosts', [
            'user' => $userData,
            'trendingData' => $trendingData,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
        ]);
    }

    /**
     * Display a single post within the feed layout
     */
    public function showPost(int $postId)
    {
        try {
            $user = auth()->user()->load('familyInfo');
            if (!$user) {
                return redirect()->route('home');
            }

            $post = \App\Models\GuestModels\Post::with(['user', 'images', 'comments.user'])->findOrFail($postId);
            $post->increment('views_count');
            $post->refresh();

            $formattedPost = $this->formatPost($post, $user->id);
            $layoutData = $this->getLayoutData($user);

            return Inertia::render('GuestPages/AuthAccessPages/Feed/Index', array_merge($layoutData, [
                'followingPosts' => [],
                'connectionPosts' => [],
                'generalPosts' => [],
                'followersPosts' => [],
                'allPosts' => [],
                'savedPosts' => [],
                'showPost' => $formattedPost,
            ]));
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Post not found');
        }
    }

    /**
     * Display a single org post within the feed layout
     */
    public function showOrgPost(int $orgPostId)
    {
        try {
            $user = auth()->user()->load('familyInfo');
            if (!$user) {
                return redirect()->route('home');
            }

            $orgPost = \App\Models\OrgModels\OrgPost::with(['organization', 'creator', 'images', 'comments.user'])
                ->findOrFail($orgPostId);
            $orgPost->increment('views_count');
            $orgPost->refresh();

            $formattedPost = $this->formatOrgPost($orgPost, $user->id);
            $layoutData = $this->getLayoutData($user);

            return Inertia::render('GuestPages/AuthAccessPages/Feed/Index', array_merge($layoutData, [
                'followingPosts' => [],
                'connectionPosts' => [],
                'generalPosts' => [],
                'followersPosts' => [],
                'allPosts' => [],
                'savedPosts' => [],
                'showPost' => $formattedPost,
            ]));
        } catch (\Exception $e) {
            return redirect('/')->with('error', 'Post not found');
        }
    }
}
