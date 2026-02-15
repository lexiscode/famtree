<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\OrgCategoryRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrgCategoryService
{
    public function __construct(private OrgCategoryRepository $repository)
    {
    }

    public function getAllCategories(): array
    {
        return $this->repository->getAll()->map(function ($cat) {
            return [
                'id' => $cat->id,
                'uuid' => $cat->uuid,
                'name' => $cat->name,
                'slug' => $cat->slug,
                'description' => $cat->description,
                'icon' => $cat->icon,
                'is_active' => $cat->is_active,
                'display_order' => $cat->display_order,
                'organizations_count' => $cat->organizations_count,
            ];
        })->toArray();
    }

    public function createCategory(array $data): bool
    {
        try {
            $data['uuid'] = Str::uuid()->toString();
            $data['slug'] = Str::slug($data['name']);
            $category = $this->repository->create($data);
            $this->logActivity('create_org_category', 'OrganizationCategory', $category->id, "Created category: {$category->name}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function updateCategory(int $id, array $data): bool
    {
        try {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }
            $category = $this->repository->update($id, $data);
            if ($category) {
                $this->logActivity('update_org_category', 'OrganizationCategory', $id, "Updated category: {$category->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function deleteCategory(int $id): bool
    {
        try {
            $category = $this->repository->find($id);
            if ($category && $category->organizations_count === 0) {
                $this->logActivity('delete_org_category', 'OrganizationCategory', $id, "Deleted category: {$category->name}");
                return $this->repository->delete($id);
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

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
            // Silently fail
        }
    }
}
