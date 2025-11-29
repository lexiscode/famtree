<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ConnectionFeedsRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use Illuminate\Database\Eloquent\Collection;

class ConnectionFeedsService
{
    public function __construct(
        private ConnectionFeedsRepository $feedRepository,
        private UserConnectionRepository $connectionRepository,
        private PrivacyService $privacyService
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
        return $this->formatPosts($filteredPosts);
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
     * @return array
     */
    private function formatPosts($posts): array
    {
        return collect($posts)->map(function (Post $post) {
            return $this->formatPost($post);
        })->values()->toArray();
    }

    /**
     * Format a single post with all related data
     *
     * @param Post $post
     * @return array
     */
    private function formatPost(Post $post): array
    {
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
            'created_at' => $post->created_at,
            'created_at_human' => $post->created_at->diffForHumans(),
            'updated_at' => $post->updated_at,
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'first_name' => $post->user->first_name,
                'last_name' => $post->user->last_name,
                'username' => $post->user->username,
                'profile_image_url' => $post->user->profile_image_url,
            ],
            'images' => $post->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_url' => $image->image_url,
                    'order' => $image->order,
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
        // Get all posts from connections
        $posts = $this->feedRepository->getConnectionsPosts($user);

        // Filter by privacy settings
        $visiblePosts = $this->filterPostsByPrivacy($posts, $user);

        // Sort by engagement score (reactions * 2 + comments * 1.5 + views * 0.1)
        $sortedPosts = $visiblePosts->sortByDesc(function (Post $post) {
            return ($post->reactions_count * 2) + ($post->comments_count * 1.5) + ($post->views_count * 0.1);
        })->take($limit);

        // Format and return
        return $this->formatPosts($sortedPosts);
    }
}
