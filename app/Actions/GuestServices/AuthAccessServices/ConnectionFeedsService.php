<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ConnectionFeedsRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Repositories\GuestRepositories\PostReactionRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class ConnectionFeedsService
{
    public function __construct(
        private ConnectionFeedsRepository $feedRepository,
        private UserConnectionRepository $connectionRepository,
        private PrivacyService $privacyService,
        private PostReactionRepository $reactionRepository
    ) {}

    /**
     * Get all connection feeds with privacy filtering applied
     *
     * @param User $user The viewing user
     * @return array Array of formatted posts respecting privacy settings
     */
    public function getConnectionFeeds(User $user): array
    {
        // Get posts from all connections
        $posts = $this->feedRepository->getConnectionsPosts($user);

        // Filter by privacy settings
        $filteredPosts = $this->filterPostsByPrivacy($posts, $user);

        // Format posts for display
        return $this->formatPosts($filteredPosts, $user->id);
    }

    /**
     * Filter posts based on privacy settings
     * Respects stories_visibility for both direct and indirect connections
     *
     * Privacy Rules:
     * - 'public': Everyone can see
     * - 'connected': Only direct connections can see
     * - 'private': Only author can see
     *
     * @param Collection $posts
     * @param User $viewer
     * @return Collection
     */
    public function filterPostsByPrivacy(Collection $posts, User $viewer): Collection
    {
        return $posts->filter(function (Post $post) use ($viewer) {
            return $this->privacyService->canViewPost($post, $viewer);
        });
    }

    /**
     * Format posts for display on frontend
     * Similar to PostService formatting
     *
     * @param Collection|Eloquent\Collection $posts
     * @param int|null $currentUserId
     * @return array
     */
    private function formatPosts($posts, $currentUserId = null): array
    {
        return collect($posts)->map(function (Post $post) use ($currentUserId) {
            return $this->formatPost($post, $currentUserId);
        })->values()->toArray();
    }

    /**
     * Format a single post with all related data
     *
     * @param Post $post
     * @param int|null $currentUserId
     * @return array
     */
    private function formatPost(Post $post, $currentUserId = null): array
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
            'created_at' => $post->created_at,
            'created_at_human' => $post->created_at->diffForHumans(),
            'updated_at' => $post->updated_at,
            'user' => [
                'id' => $post->user->id,
                'name' => trim($post->user->first_name . ' ' . $post->user->last_name),
                'first_name' => $post->user->first_name,
                'last_name' => $post->user->last_name,
                'username' => $post->user->username,
                'profile_image_url' => $post->user->profile_image_url,
            ],
            'images' => $post->images->map(function ($image) {
                // Fix double storage path issue: /storage/storage/ -> /storage/
                $rawUrl = $image->getAttributes()['image_url'] ?? '';
                $fixedUrl = str_replace('/storage/storage/', '/storage/', $rawUrl);

                return [
                    'id' => $image->id,
                    'url' => $fixedUrl,
                    'order' => $image->order,
                ];
            })->toArray(),
            'comments' => $post->comments->map(function ($comment) {
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
            })->toArray(),
            'reactions_count' => $post->reactions->count(),
            'comments_count' => $post->comments->count(),
        ];
    }

    /**
     * Get statistics about connection feeds
     *
     * @param User $user
     * @return array
     */
    public function getConnectionFeedsStats(User $user): array
    {
        $directConnections = $this->feedRepository->getDirectConnections($user);
        $indirectConnections = $this->feedRepository->getIndirectConnections($user);

        $allPosts = $this->feedRepository->getConnectionsPosts($user);
        $filteredPosts = $this->filterPostsByPrivacy($allPosts, $user);

        return [
            'total_direct_connections' => $directConnections->count(),
            'total_indirect_connections' => $indirectConnections->count(),
            'total_connections' => $directConnections->count() + $indirectConnections->count(),
            'total_posts' => $allPosts->count(),
            'visible_posts' => count($filteredPosts),
            'hidden_posts' => $allPosts->count() - count($filteredPosts),
        ];
    }

    /**
     * Get top trending posts from connections based on engagement
     *
     * @param User $user
     * @param int $limit
     * @return array
     */
    public function getTopTrendingPosts(User $user, int $limit = 5): array
    {
        // Get all posts from the entire platform
        $posts = $this->feedRepository->getAllPlatformPosts();

        // Filter by privacy settings
        $visiblePosts = $this->filterPostsByPrivacy($posts, $user);

        // Sort by engagement score (reactions * 2 + comments * 1.5 + views * 0.1)
        $sortedPosts = $visiblePosts->sortByDesc(function (Post $post) {
            return ($post->reactions_count * 2) + ($post->comments_count * 1.5) + ($post->views_count * 0.1);
        })->take($limit);

        // Format and return
        return $this->formatPosts($sortedPosts, $user->id);
    }

    /**
     * Get paginated trending posts from the entire platform
     *
     * @param User $user
     * @param int $perPage
     * @return array
     */
    public function getPaginatedTrendingPosts(User $user, int $perPage = 15): array
    {
        $posts = $this->feedRepository->getAllPlatformPosts();

        // Filter by privacy settings
        $visiblePosts = $this->filterPostsByPrivacy($posts, $user);

        // Sort by engagement score
        $sortedPosts = $visiblePosts->sortByDesc(function (Post $post) {
            return ($post->reactions_count * 2) + ($post->comments_count * 1.5) + ($post->views_count * 0.1);
        })->values();

        // Manual pagination
        $currentPage = (int) request()->get('page', 1);
        $total = $sortedPosts->count();
        $lastPage = max(1, (int) ceil($total / $perPage));
        $currentPage = min($currentPage, $lastPage);
        $offset = ($currentPage - 1) * $perPage;

        $paginated = $sortedPosts->slice($offset, $perPage)->values();

        return [
            'posts' => $this->formatPosts($paginated, $user->id),
            'current_page' => $currentPage,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'total' => $total,
        ];
    }
}
