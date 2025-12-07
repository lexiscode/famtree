<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
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

        // Check if user owns the post
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

        // Check if user owns the post
        if ($post->user_id !== $user->id) {
            throw new \Exception('Unauthorized to delete this post');
        }

        return $this->postRepository->delete($postId);
    }

    /**
     * Get user's posts
     */
    public function getUserPosts(int $userId, int $limit = 20, int $offset = 0)
    {
        $posts = $this->postRepository->getUserPosts($userId, $limit, $offset);
        $currentUserId = auth()->id();
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
     * Search user posts
     */
    public function searchPosts(int $userId, string $query)
    {
        $posts = $this->postRepository->searchUserPosts($userId, $query);
        $currentUserId = auth()->id();
        return $this->formatPosts($posts, $currentUserId);
    }

    /**
     * Filter posts by type
     */
    public function filterPostsByType(int $userId, string $type)
    {
        $posts = $this->postRepository->filterByType($userId, $type);
        $currentUserId = auth()->id();
        return $this->formatPosts($posts, $currentUserId);
    }

    /**
     * Add a comment to a post
     */
    public function addComment(int $postId, User $user, string $content)
    {
        $comment = $this->commentRepository->create([
            'post_id' => $postId,
            'user_id' => $user->id,
            'content' => $content,
        ]);

        // Update post comment count
        $this->postRepository->updateCommentCount($postId);

        return $this->formatComment($comment);
    }

    /**
     * Get post comments
     */
    public function getPostComments(int $postId)
    {
        $comments = $this->commentRepository->getPostComments($postId);
        return $comments->map(fn($comment) => $this->formatComment($comment));
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
     * Add a reaction to a post
     */
    public function addReaction(int $postId, User $user, string $reactionType)
    {
        $reaction = $this->reactionRepository->createOrUpdate($postId, $user->id, $reactionType);

        // Update post reaction count
        $this->postRepository->updateReactionCount($postId);

        return $this->formatReaction($reaction);
    }

    /**
     * Remove a reaction
     */
    public function removeReaction(int $postId, User $user)
    {
        $this->reactionRepository->delete($postId, $user->id);

        // Update post reaction count
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
     * Format a post for response
     */
    private function formatPost($post, $currentUserId = null)
    {
        $userReaction = null;
        if ($currentUserId) {
            $reaction = $this->reactionRepository->getUserReaction($post->id, $currentUserId);
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
            'images' => $post->images->map(fn($img) => [
                'id' => $img->id,
                'url' => $img->image_url,
                'order' => $img->order,
            ]),
            'comments' => $post->comments->map(fn($comment) => $this->formatComment($comment)),
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
     * Format a comment
     */
    private function formatComment($comment)
    {
        return [
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
     * Get engagement statistics for user's posts
     */
    public function getEngagementStats(int $userId)
    {
        $posts = $this->postRepository->getUserPosts($userId, 1000);

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
     * Get top engaged posts
     */
    public function getTopEngagedPosts(int $userId, int $limit = 5)
    {
        $posts = $this->postRepository->getUserPosts($userId, 1000);

        $topPosts = $posts
            ->sortByDesc(function ($post) {
                return ($post->reactions_count * 2) + ($post->comments_count * 1.5) + ($post->views_count * 0.1);
            })
            ->take($limit);

        $currentUserId = auth()->id();
        return $this->formatPosts($topPosts, $currentUserId);
    }
}
