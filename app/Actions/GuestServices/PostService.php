<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Models\GuestModels\PostComment;
use App\Models\GuestModels\PostRefam;
use App\Models\GuestModels\PostSave;
use App\Models\OrgModels\OrgPost;
use App\Models\OrgModels\OrgPostComment;
use App\Models\OrgModels\OrgPostCommentLike;
use App\Repositories\GuestRepositories\PostRepository;
use App\Repositories\GuestRepositories\PostCommentRepository;
use App\Repositories\GuestRepositories\PostReactionRepository;
use Illuminate\Support\Facades\Storage;

class PostService
{
    public function __construct(
        private PostRepository $postRepository,
        private PostCommentRepository $commentRepository,
        private PostReactionRepository $reactionRepository,
    ) {}

    /**
     * Create a new post
     */
    public function createPost(User $user, array $data)
    {
        $postData = [
            'user_id' => $user->id,
            'type' => $data['type'],
            'privacy' => $data['privacy'] ?? 'connected',
            'title' => $data['title'] ?? null,
            'content' => $data['type'] === 'text' ? $data['content'] : null,
        ];

        // Handle voice post
        if ($data['type'] === 'voice' && isset($data['voice_file'])) {
            $voiceFile = $data['voice_file'];
            $voicePath = Storage::disk('public')->put('posts/voice', $voiceFile);
            $postData['voice_url'] = '/storage/' . $voicePath;
            $postData['voice_duration'] = $data['voice_duration'] ?? 0;
        }

        $post = $this->postRepository->create($postData);

        // Handle images
        if (isset($data['images']) && is_array($data['images'])) {
            foreach ($data['images'] as $index => $image) {
                if ($image instanceof \Illuminate\Http\UploadedFile) {
                    $imagePath = Storage::disk('public')->put('posts/images', $image);
                    $post->images()->create([
                        'image_url' => '/storage/' . $imagePath,
                        'order' => $index,
                    ]);
                }
            }
        }

        return $post->load('images', 'user');
    }

    /**
     * Update a post
     */
    public function updatePost(int $postId, User $user, array $data)
    {
        $post = $this->postRepository->find($postId);

        if ($post->user_id !== $user->id) {
            throw new \Exception('Unauthorized to update this post');
        }

        $updateData = [];

        if (isset($data['title'])) {
            $updateData['title'] = $data['title'];
        }

        if (isset($data['content'])) {
            $updateData['content'] = $data['content'];
        }

        $post = $this->postRepository->update($postId, $updateData);

        return $post->load('images', 'user');
    }

    /**
     * Delete a post
     */
    public function deletePost(int $postId, User $user)
    {
        $post = $this->postRepository->find($postId);

        if ($post->user_id !== $user->id) {
            throw new \Exception('Unauthorized to delete this post');
        }

        return $this->postRepository->delete($postId);
    }

    /**
     * Get user's posts (filtered by privacy settings)
     */
    public function getUserPosts(int $userId, int $limit = 20, int $offset = 0)
    {
        $currentUserId = auth()->id();
        $posts = $this->postRepository->getUserPosts($userId, $currentUserId, $limit, $offset);
        return $this->formatPosts($posts, $currentUserId);
    }

    /**
     * Get a single post with full details
     */
    public function getPost(int $postId)
    {
        $this->postRepository->incrementViews($postId);
        $post = $this->postRepository->find($postId);
        $currentUserId = auth()->id();
        return $this->formatPost($post, $currentUserId);
    }

    /**
     * Search user posts (filtered by privacy settings)
     */
    public function searchPosts(int $userId, string $query)
    {
        $currentUserId = auth()->id();
        $posts = $this->postRepository->searchUserPosts($userId, $currentUserId, $query);
        return $this->formatPosts($posts, $currentUserId);
    }

    /**
     * Filter posts by type (filtered by privacy settings)
     */
    public function filterPostsByType(int $userId, string $type)
    {
        $currentUserId = auth()->id();
        $posts = $this->postRepository->filterByType($userId, $currentUserId, $type);
        return $this->formatPosts($posts, $currentUserId);
    }

    /**
     * Add a comment to a post (supports threading)
     */
    public function addComment(int $postId, User $user, string $content, ?int $parentCommentId = null)
    {
        $commentData = [
            'post_id' => $postId,
            'user_id' => $user->id,
            'content' => $content,
        ];

        if ($parentCommentId) {
            $commentData['parent_comment_id'] = $parentCommentId;
        }

        $comment = $this->commentRepository->create($commentData);

        // Update post comment count
        $this->postRepository->updateCommentCount($postId);

        return $this->formatComment($comment->load(['user', 'replies.user']), $user->id);
    }

    /**
     * Get threaded post comments
     */
    public function getPostComments(int $postId, ?int $currentUserId = null)
    {
        $currentUserId = $currentUserId ?? auth()->id();
        $comments = $this->commentRepository->getPostComments($postId);
        return $comments->map(fn($comment) => $this->formatComment($comment, $currentUserId));
    }

    /**
     * Delete a comment
     */
    public function deleteComment(int $commentId, User $user)
    {
        $comment = $this->commentRepository->find($commentId);

        if ($comment->user_id !== $user->id) {
            throw new \Exception('Unauthorized to delete this comment');
        }

        $postId = $comment->post_id;
        $this->commentRepository->delete($commentId);

        // Update post comment count
        $this->postRepository->updateCommentCount($postId);

        return true;
    }

    /**
     * Toggle a like on a comment
     */
    public function toggleCommentLike(int $commentId, User $user): array
    {
        return $this->commentRepository->toggleLike($commentId, $user->id);
    }

    /**
     * Toggle a like on an org comment
     */
    public function toggleOrgCommentLike(int $commentId, User $user): array
    {
        $existing = OrgPostCommentLike::where('comment_id', $commentId)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            $existing->delete();
            OrgPostComment::where('id', $commentId)->decrement('likes_count');
            $comment = OrgPostComment::find($commentId);
            return ['liked' => false, 'likes_count' => $comment->likes_count];
        }

        OrgPostCommentLike::create([
            'comment_id' => $commentId,
            'user_id' => $user->id,
        ]);
        OrgPostComment::where('id', $commentId)->increment('likes_count');
        $comment = OrgPostComment::find($commentId);
        return ['liked' => true, 'likes_count' => $comment->likes_count];
    }

    /**
     * Get a comment thread by UUID (for shareable comment page)
     */
    public function getCommentThread(string $uuid, ?int $currentUserId = null)
    {
        // Try regular post comment first
        $comment = $this->commentRepository->findByUuid($uuid);
        if ($comment) {
            return [
                'type' => 'post',
                'comment' => $this->formatComment($comment->load(['replies.user', 'replies.likes']), $currentUserId),
                'post' => $this->formatPost($comment->post, $currentUserId),
                'other_comments' => $this->getPostComments($comment->post_id, $currentUserId),
            ];
        }

        // Try org post comment
        $orgComment = OrgPostComment::where('uuid', $uuid)
            ->with(['user', 'orgPost.organization', 'orgPost.creator', 'orgPost.images', 'replies.user', 'replies.likes', 'parent.user'])
            ->first();

        if ($orgComment) {
            $allComments = OrgPostComment::where('org_post_id', $orgComment->org_post_id)
                ->whereNull('parent_comment_id')
                ->with(['user', 'replies.user', 'replies.likes'])
                ->withCount('replies')
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(fn($c) => $this->formatOrgComment($c, $currentUserId));

            return [
                'type' => 'org',
                'comment' => $this->formatOrgComment($orgComment, $currentUserId),
                'org_post' => $this->formatOrgPostForThread($orgComment->orgPost, $currentUserId),
                'other_comments' => $allComments,
            ];
        }

        return null;
    }

    /**
     * Add a reaction to a post
     */
    public function addReaction(int $postId, User $user, string $reactionType)
    {
        $reaction = $this->reactionRepository->createOrUpdate($postId, $user->id, $reactionType);

        $this->postRepository->updateReactionCount($postId);

        return $this->formatReaction($reaction);
    }

    /**
     * Remove a reaction
     */
    public function removeReaction(int $postId, User $user)
    {
        $this->reactionRepository->delete($postId, $user->id);

        $this->postRepository->updateReactionCount($postId);

        return true;
    }

    /**
     * Get post reactions
     */
    public function getPostReactions(int $postId)
    {
        $reactions = $this->reactionRepository->getPostReactions($postId);
        $counts = [];

        foreach (['like', 'love', 'haha', 'wow', 'sad', 'angry'] as $type) {
            $counts[$type] = $reactions->where('reaction_type', $type)->count();
        }

        return [
            'counts' => $counts,
            'reactions' => $reactions->map(fn($r) => $this->formatReaction($r)),
        ];
    }

    /**
     * Toggle refam (reshare) on a post
     */
    public function toggleRefam(int $postId, User $user, bool $isOrg = false): array
    {
        if ($isOrg) {
            $existing = PostRefam::where('org_post_id', $postId)->where('user_id', $user->id)->first();
            if ($existing) {
                $existing->delete();
                OrgPost::where('id', $postId)->decrement('refams_count');
                $post = OrgPost::find($postId);
                return ['refammed' => false, 'refams_count' => $post->refams_count];
            }
            PostRefam::create(['org_post_id' => $postId, 'user_id' => $user->id]);
            OrgPost::where('id', $postId)->increment('refams_count');
            $post = OrgPost::find($postId);
            return ['refammed' => true, 'refams_count' => $post->refams_count];
        }

        $existing = PostRefam::where('post_id', $postId)->where('user_id', $user->id)->first();
        if ($existing) {
            $existing->delete();
            Post::where('id', $postId)->decrement('refams_count');
            $post = Post::find($postId);
            return ['refammed' => false, 'refams_count' => $post->refams_count];
        }
        PostRefam::create(['post_id' => $postId, 'user_id' => $user->id]);
        Post::where('id', $postId)->increment('refams_count');
        $post = Post::find($postId);
        return ['refammed' => true, 'refams_count' => $post->refams_count];
    }

    /**
     * Toggle save (bookmark) on a post
     */
    public function toggleSave(int $postId, User $user, bool $isOrg = false): array
    {
        if ($isOrg) {
            $existing = PostSave::where('org_post_id', $postId)->where('user_id', $user->id)->first();
            if ($existing) {
                $existing->delete();
                return ['saved' => false];
            }
            PostSave::create(['org_post_id' => $postId, 'user_id' => $user->id]);
            return ['saved' => true];
        }

        $existing = PostSave::where('post_id', $postId)->where('user_id', $user->id)->first();
        if ($existing) {
            $existing->delete();
            return ['saved' => false];
        }
        PostSave::create(['post_id' => $postId, 'user_id' => $user->id]);
        return ['saved' => true];
    }

    /**
     * Format a post for response
     */
    private function formatPost($post, $currentUserId = null)
    {
        $userReaction = null;
        if ($currentUserId) {
            $reaction = $this->reactionRepository->getUserReaction($post->id, $currentUserId);
            $userReaction = $reaction ? $reaction->reaction_type : null;
        }

        // Get threaded comments
        $comments = PostComment::where('post_id', $post->id)
            ->whereNull('parent_comment_id')
            ->with(['user', 'replies.user', 'replies.likes'])
            ->withCount('replies')
            ->orderBy('created_at', 'desc')
            ->get();

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
                $rawUrl = $img->getAttributes()['image_url'] ?? '';
                $fixedUrl = str_replace('/storage/storage/', '/storage/', $rawUrl);

                return [
                    'id' => $img->id,
                    'url' => $fixedUrl,
                    'order' => $img->order,
                ];
            }),
            'comments' => $comments->map(fn($comment) => $this->formatComment($comment, $currentUserId)),
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
     * Format multiple posts
     */
    private function formatPosts($posts, $currentUserId = null)
    {
        return $posts->map(fn($post) => $this->formatPost($post, $currentUserId));
    }

    /**
     * Format a comment (with threading support)
     */
    private function formatComment($comment, $currentUserId = null)
    {
        $userHasLiked = false;
        if ($currentUserId) {
            $userHasLiked = $this->commentRepository->userHasLiked($comment->id, $currentUserId);
        }

        $formatted = [
            'id' => $comment->id,
            'uuid' => $comment->uuid,
            'content' => $comment->content,
            'parent_comment_id' => $comment->parent_comment_id,
            'likes_count' => $comment->likes_count ?? 0,
            'user_has_liked' => $userHasLiked,
            'replies_count' => $comment->replies_count ?? $comment->replies()->count(),
            'is_reply' => $comment->isReply(),
            'user' => [
                'id' => $comment->user->id,
                'name' => trim($comment->user->first_name . ' ' . $comment->user->last_name),
                'username' => $comment->user->username,
                'profile_image_url' => $comment->user->profile_image_url,
            ],
            'created_at' => $comment->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $comment->created_at->diffForHumans(),
        ];

        // Include replies if loaded (only for top-level comments)
        if (!$comment->isReply() && $comment->relationLoaded('replies')) {
            $formatted['replies'] = $comment->replies->map(fn($reply) => $this->formatComment($reply, $currentUserId))->values()->toArray();
        } else {
            $formatted['replies'] = [];
        }

        return $formatted;
    }

    /**
     * Format an org comment (with threading support)
     */
    private function formatOrgComment($comment, $currentUserId = null)
    {
        $userHasLiked = false;
        if ($currentUserId) {
            $userHasLiked = OrgPostCommentLike::where('comment_id', $comment->id)
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
            'is_reply' => $comment->isReply(),
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

        if (!$comment->isReply() && $comment->relationLoaded('replies')) {
            $formatted['replies'] = $comment->replies->map(fn($reply) => $this->formatOrgComment($reply, $currentUserId))->values()->toArray();
        } else {
            $formatted['replies'] = [];
        }

        return $formatted;
    }

    /**
     * Format an org post for the comment thread page
     */
    private function formatOrgPostForThread($orgPost, $currentUserId = null)
    {
        $org = $orgPost->organization;
        $userReaction = null;
        if ($currentUserId) {
            $reaction = \App\Models\OrgModels\OrgPostReaction::where('org_post_id', $orgPost->id)
                ->where('user_id', $currentUserId)
                ->first();
            $userReaction = $reaction ? $reaction->reaction_type : null;
        }

        return [
            'id' => 'org_' . $orgPost->id,
            'org_post_id' => $orgPost->id,
            'type' => $orgPost->type,
            'title' => null,
            'content' => $orgPost->content,
            'voice_url' => $orgPost->voice_url,
            'voice_duration' => $orgPost->voice_duration,
            'views_count' => $orgPost->views_count,
            'comments_count' => $orgPost->comments_count,
            'reactions_count' => $orgPost->reactions_count,
            'user_reaction' => $userReaction,
            'images' => $orgPost->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->full_image_url ?? $img->image_url,
                'order' => $img->order,
            ])->toArray(),
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
     * Format a reaction
     */
    private function formatReaction($reaction)
    {
        return [
            'id' => $reaction->id,
            'type' => $reaction->reaction_type,
            'user' => [
                'id' => $reaction->user->id,
                'name' => $reaction->user->name,
                'username' => $reaction->user->username,
            ],
            'created_at' => $reaction->created_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Get engagement statistics for user's posts (filtered by privacy settings)
     */
    public function getEngagementStats(int $userId)
    {
        $currentUserId = auth()->id();
        $posts = $this->postRepository->getUserPosts($userId, $currentUserId, 1000, 0);

        $totalReactions = $posts->sum('reactions_count');
        $totalComments = $posts->sum('comments_count');
        $totalViews = $posts->sum('views_count');
        $totalPosts = $posts->count();

        $textPostCount = $posts->where('type', 'text')->count();
        $voicePostCount = $posts->where('type', 'voice')->count();

        return [
            'total_posts' => $totalPosts,
            'total_reactions' => $totalReactions,
            'total_comments' => $totalComments,
            'total_views' => $totalViews,
            'text_posts' => $textPostCount,
            'voice_posts' => $voicePostCount,
        ];
    }

    /**
     * Get top engaged posts (filtered by privacy settings)
     */
    public function getTopEngagedPosts(int $userId, int $limit = 5)
    {
        $currentUserId = auth()->id();
        $posts = $this->postRepository->getUserPosts($userId, $currentUserId, 1000, 0);

        $topPosts = $posts
            ->sortByDesc(function ($post) {
                return ($post->reactions_count * 2) + ($post->comments_count * 1.5) + ($post->views_count * 0.1);
            })
            ->take($limit);

        return $this->formatPosts($topPosts, $currentUserId);
    }
}
