<?php
namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\PostRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class PostModerationService
{
    public function __construct(private PostRepository $repository) {}

    public function getAllPosts(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPostsPaginated($perPage, $page)->through(fn($post) => $this->formatPost($post));
    }

    public function searchPosts(string $query, int $perPage = 15, int $page = 1)
    {
        return $this->repository->searchPosts($query, $perPage, $page)->through(fn($post) => $this->formatPost($post));
    }

    public function getFilteredPosts(array $filters, int $perPage = 15, int $page = 1)
    {
        return $this->repository->filterPosts($filters, $perPage, $page)->through(fn($post) => $this->formatPost($post));
    }

    public function getPostDetails(int $id): ?array
    {
        $post = $this->repository->findPost($id);
        if (!$post) return null;

        return [
            'id' => $post->id,
            'type' => $post->type,
            'privacy' => $post->privacy,
            'content' => $post->content,
            'voice_url' => $post->voice_url,
            'voice_duration' => $post->voice_duration,
            'views_count' => $post->views_count,
            'comments_count' => $post->comments_count,
            'reactions_count' => $post->reactions_count,
            'refams_count' => $post->refams_count,
            'user' => $post->user ? [
                'id' => $post->user->id,
                'full_name' => "{$post->user->first_name} {$post->user->last_name}",
                'username' => $post->user->username,
                'email' => $post->user->email,
                'profile_image_url' => $post->user->profile_image_url,
            ] : null,
            'images' => $post->images->map(fn($img) => [
                'id' => $img->id, 'image_url' => $img->image_url, 'order' => $img->order,
            ]),
            'comments' => $post->comments->map(fn($c) => [
                'id' => $c->id,
                'content' => $c->content,
                'user' => $c->user ? ['id' => $c->user->id, 'full_name' => "{$c->user->first_name} {$c->user->last_name}", 'username' => $c->user->username] : null,
                'created_at' => $c->created_at->format('Y-m-d H:i:s'),
            ]),
            'reactions' => $post->reactions->groupBy('reaction_type')->map->count(),
            'created_at' => $post->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $post->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function deletePost(int $id): bool
    {
        try {
            $post = $this->repository->findPost($id);
            if ($post) {
                $this->logActivity('delete_post', 'Post', $id, "Deleted post by user: {$post->user?->username}");
                return $this->repository->deletePost($id);
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function deleteComment(int $id): bool
    {
        try {
            $comment = $this->repository->findComment($id);
            if ($comment) {
                $this->logActivity('delete_comment', 'PostComment', $id, "Deleted comment by user: {$comment->user?->username}");
                return $this->repository->deleteComment($id);
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function getPostStats(): array
    {
        return [
            'total' => $this->repository->countPosts(),
            'total_with_deleted' => $this->repository->countPostsWithTrashed(),
        ];
    }

    public function getAllGalleries(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllGalleriesPaginated($perPage, $page)->through(fn($g) => [
            'id' => $g->id,
            'title' => $g->title,
            'description' => $g->description,
            'file_url' => $g->file_url,
            'file_type' => $g->file_type,
            'thumbnail_url' => $g->thumbnail_url,
            'user' => $g->user ? ['id' => $g->user->id, 'full_name' => "{$g->user->first_name} {$g->user->last_name}", 'username' => $g->user->username] : null,
            'created_at' => $g->created_at->format('Y-m-d'),
        ]);
    }

    public function deleteGallery(int $id): bool
    {
        try {
            $gallery = $this->repository->findGallery($id);
            if ($gallery) {
                $this->logActivity('delete_gallery', 'Gallery', $id, "Deleted gallery: {$gallery->title}");
                return $this->repository->deleteGallery($id);
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function getAllOrgPosts(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllOrgPostsPaginated($perPage, $page)->through(fn($post) => [
            'id' => $post->id,
            'type' => $post->type,
            'content' => $post->content,
            'organization' => $post->organization ? ['id' => $post->organization->id, 'name' => $post->organization->name] : null,
            'creator' => $post->creator ? ['id' => $post->creator->id, 'username' => $post->creator->username, 'display_name' => $post->creator->display_name] : null,
            'comments_count' => $post->comments_count,
            'reactions_count' => $post->reactions_count,
            'is_pinned' => $post->is_pinned,
            'created_at' => $post->created_at->format('Y-m-d'),
        ]);
    }

    private function formatPost($post): array
    {
        return [
            'id' => $post->id,
            'type' => $post->type,
            'privacy' => $post->privacy,
            'content' => \Illuminate\Support\Str::limit($post->content, 150),
            'full_content' => $post->content,
            'voice_url' => $post->voice_url,
            'views_count' => $post->views_count ?? 0,
            'comments_count' => $post->comments_count,
            'reactions_count' => $post->reactions_count,
            'refams_count' => $post->refams_count,
            'has_images' => $post->images->count() > 0,
            'image_count' => $post->images->count(),
            'user' => $post->user ? [
                'id' => $post->user->id,
                'full_name' => "{$post->user->first_name} {$post->user->last_name}",
                'username' => $post->user->username,
                'profile_image_url' => $post->user->profile_image_url,
            ] : null,
            'created_at' => $post->created_at->format('Y-m-d'),
            'created_at_formatted' => $post->created_at->diffForHumans(),
        ];
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {}
    }
}
