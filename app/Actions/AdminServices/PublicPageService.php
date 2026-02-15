<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\PublicPageRepository;
use App\Models\AdminModels\PublicPage;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PublicPageService
{
    public function __construct(private PublicPageRepository $repository)
    {
    }

    /**
     * Get all pages with pagination and stats
     */
    public function getAllPages(int $perPage = 15, int $page = 1): array
    {
        $pages = $this->repository->getAllPaginated($perPage, $page)->through(function ($page) {
            return $this->formatPageForList($page);
        });

        $stats = [
            'total' => $this->repository->count(),
            'published' => $this->repository->countPublished(),
            'drafts' => $this->repository->countDrafts(),
        ];

        return [
            'pages' => $pages,
            'stats' => $stats,
        ];
    }

    /**
     * Get page details
     */
    public function getPageDetails(int $id): ?array
    {
        $page = $this->repository->find($id);

        if (!$page) {
            return null;
        }

        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'content' => $page->content,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'meta_keywords' => $page->meta_keywords,
            'is_published' => $page->is_published,
            'created_by' => $page->createdBy?->username ?? null,
            'created_at' => $page->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $page->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Create a new page
     */
    public function createPage(array $data): ?PublicPage
    {
        try {
            $admin = Auth::guard('admin')->user();
            $data['created_by_admin_id'] = $admin?->id;

            if (empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            $page = $this->repository->create($data);

            $this->logActivity('create_page', 'PublicPage', $page->id, "Created public page: {$page->title}");

            return $page;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Update a page
     */
    public function updatePage(int $id, array $data): bool
    {
        try {
            if (isset($data['title']) && empty($data['slug'])) {
                $data['slug'] = Str::slug($data['title']);
            }

            $page = $this->repository->update($id, $data);

            if ($page) {
                $this->logActivity('update_page', 'PublicPage', $id, "Updated public page: {$page->title}");
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Delete a page
     */
    public function deletePage(int $id): bool
    {
        try {
            $page = $this->repository->find($id);

            if ($page) {
                $this->logActivity('delete_page', 'PublicPage', $id, "Deleted public page: {$page->title}");
                return $this->repository->delete($id);
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Publish or unpublish a page
     */
    public function publishPage(int $id, bool $publish = true): bool
    {
        try {
            $page = $this->repository->update($id, ['is_published' => $publish]);

            if ($page) {
                $action = $publish ? 'Published' : 'Unpublished';
                $this->logActivity('publish_page', 'PublicPage', $id, "{$action} public page: {$page->title}");
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Format page data for list view
     */
    private function formatPageForList(PublicPage $page): array
    {
        return [
            'id' => $page->id,
            'title' => $page->title,
            'slug' => $page->slug,
            'is_published' => $page->is_published,
            'meta_title' => $page->meta_title,
            'meta_description' => $page->meta_description,
            'created_by' => $page->createdBy?->username ?? null,
            'created_at' => $page->created_at->format('Y-m-d'),
            'updated_at' => $page->updated_at->format('Y-m-d'),
            'updated_at_formatted' => $page->updated_at->diffForHumans(),
        ];
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
        }
    }
}
