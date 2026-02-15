<?php
namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\BlogRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class BlogService
{
    public function __construct(private BlogRepository $repository) {}

    public function getAllPosts(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page)->through(fn($p) => [
            'id' => $p->id, 'title' => $p->title, 'slug' => $p->slug, 'excerpt' => $p->excerpt,
            'category' => $p->category, 'author' => $p->author, 'is_published' => $p->is_published,
            'view_count' => $p->view_count, 'published_at' => $p->published_at?->format('Y-m-d'),
            'created_at' => $p->created_at->format('Y-m-d'),
        ]);
    }

    public function getPostDetails(int $id): ?array
    {
        $post = $this->repository->find($id);
        if (!$post) return null;
        return [
            'id' => $post->id, 'title' => $post->title, 'slug' => $post->slug,
            'excerpt' => $post->excerpt, 'content' => $post->content,
            'featured_image' => $post->featured_image, 'category' => $post->category,
            'author' => $post->author, 'is_published' => $post->is_published,
            'view_count' => $post->view_count,
            'published_at' => $post->published_at?->format('Y-m-d H:i:s'),
            'created_at' => $post->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $post->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function createPost(array $data): ?BlogPost
    {
        try {
            $data['slug'] = Str::slug($data['title']);
            $post = $this->repository->create($data);
            $this->logActivity('create_blog_post', 'BlogPost', $post->id, "Created blog post: {$post->title}");
            return $post;
        } catch (\Exception $e) { return null; }
    }

    public function updatePost(int $id, array $data): bool
    {
        try {
            if (isset($data['title'])) { $data['slug'] = Str::slug($data['title']); }
            $post = $this->repository->update($id, $data);
            if ($post) {
                $this->logActivity('update_blog_post', 'BlogPost', $id, "Updated blog post: {$post->title}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function deletePost(int $id): bool
    {
        try {
            $post = $this->repository->find($id);
            if ($post) {
                $this->logActivity('delete_blog_post', 'BlogPost', $id, "Deleted blog post: {$post->title}");
                return $this->repository->delete($id);
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function publishPost(int $id): bool
    {
        try {
            $post = $this->repository->update($id, ['is_published' => true, 'published_at' => now()]);
            if ($post) {
                $this->logActivity('publish_blog_post', 'BlogPost', $id, "Published blog post: {$post->title}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function unpublishPost(int $id): bool
    {
        try {
            $post = $this->repository->update($id, ['is_published' => false]);
            if ($post) {
                $this->logActivity('unpublish_blog_post', 'BlogPost', $id, "Unpublished blog post: {$post->title}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function getStats(): array
    {
        return ['total' => $this->repository->count(), 'published' => $this->repository->countPublished(), 'draft' => $this->repository->count() - $this->repository->countPublished()];
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create(['admin_id' => $admin?->id, 'action_type' => $actionType, 'resource_type' => $resourceType, 'resource_id' => $resourceId, 'description' => $description, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent()]);
        } catch (\Exception $e) {}
    }
}
