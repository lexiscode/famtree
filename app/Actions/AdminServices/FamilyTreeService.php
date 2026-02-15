<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\FamilyTreeRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class FamilyTreeService
{
    public function __construct(private FamilyTreeRepository $repository)
    {
    }

    /**
     * Get all trees with pagination and formatting
     */
    public function getAllTrees(array $filters = [], int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page, $filters)->through(function ($tree) {
            return $this->formatTreeForList($tree);
        });
    }

    /**
     * Get tree details
     */
    public function getTreeDetails(int $id): ?array
    {
        $tree = $this->repository->find($id);

        if (!$tree) {
            return null;
        }

        return [
            'id' => $tree->id,
            'uuid' => $tree->uuid,
            'tree_name' => $tree->tree_name,
            'merged_group_name' => $tree->merged_group_name,
            'description' => $tree->description,
            'is_public' => $tree->is_public,
            'is_nuclear_family' => $tree->is_nuclear_family,
            'is_merged' => $tree->isMerged(),
            'has_merged_trees' => $tree->hasMergedTrees(),
            'merged_tree_ids' => $tree->merged_tree_ids,
            'merged_at' => $tree->merged_at?->format('Y-m-d H:i:s'),
            'members_count' => $tree->members_count,
            'admins_count' => $tree->admins_count,
            'root_user' => $tree->rootUser ? [
                'id' => $tree->rootUser->id,
                'first_name' => $tree->rootUser->first_name,
                'last_name' => $tree->rootUser->last_name,
                'full_name' => "{$tree->rootUser->first_name} {$tree->rootUser->last_name}",
                'username' => $tree->rootUser->username,
                'email' => $tree->rootUser->email,
                'profile_image_url' => $tree->rootUser->profile_image_url,
            ] : null,
            'created_by' => $tree->createdBy ? [
                'id' => $tree->createdBy->id,
                'first_name' => $tree->createdBy->first_name,
                'last_name' => $tree->createdBy->last_name,
                'username' => $tree->createdBy->username,
            ] : null,
            'members' => $tree->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'nuclear_family_role' => $member->nuclear_family_role,
                    'can_add_members' => $member->can_add_members,
                    'added_at' => $member->added_at?->format('Y-m-d H:i:s'),
                    'user' => $member->user ? [
                        'id' => $member->user->id,
                        'first_name' => $member->user->first_name,
                        'last_name' => $member->user->last_name,
                        'full_name' => "{$member->user->first_name} {$member->user->last_name}",
                        'username' => $member->user->username,
                        'email' => $member->user->email,
                        'profile_image_url' => $member->user->profile_image_url,
                    ] : null,
                ];
            })->toArray(),
            'admins' => $tree->admins->map(function ($admin) {
                return [
                    'id' => $admin->id,
                    'role' => $admin->role,
                    'granted_at' => $admin->granted_at?->format('Y-m-d H:i:s'),
                    'user' => $admin->user ? [
                        'id' => $admin->user->id,
                        'first_name' => $admin->user->first_name,
                        'last_name' => $admin->user->last_name,
                        'full_name' => "{$admin->user->first_name} {$admin->user->last_name}",
                        'username' => $admin->user->username,
                        'profile_image_url' => $admin->user->profile_image_url,
                    ] : null,
                ];
            })->toArray(),
            'created_at' => $tree->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $tree->created_at->diffForHumans(),
            'updated_at' => $tree->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Delete a family tree
     */
    public function deleteTree(int $id): bool
    {
        try {
            $tree = $this->repository->find($id);
            if ($tree) {
                $this->logActivity('delete_family_tree', 'FamilyTree', $id, "Deleted family tree: {$tree->tree_name}");
                return $this->repository->delete($id);
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Toggle tree visibility
     */
    public function toggleVisibility(int $id): bool
    {
        try {
            $tree = $this->repository->toggleVisibility($id);
            if ($tree) {
                $status = $tree->is_public ? 'public' : 'private';
                $this->logActivity('toggle_tree_visibility', 'FamilyTree', $id, "Changed family tree '{$tree->tree_name}' visibility to {$status}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get family tree and connection statistics
     */
    public function getStats(): array
    {
        return [
            'total_trees' => $this->repository->count(),
            'public_trees' => $this->repository->countPublic(),
            'private_trees' => $this->repository->countPrivate(),
        ];
    }

    /**
     * Get platform-wide connection statistics
     */
    public function getConnectionStats(): array
    {
        return [
            'total_user_connections' => $this->repository->countUserConnections(),
            'accepted_user_connections' => $this->repository->countUserConnectionsByStatus('accepted'),
            'pending_user_connections' => $this->repository->countUserConnectionsByStatus('pending'),
            'total_tree_connections' => $this->repository->countTreeConnections(),
            'accepted_tree_connections' => $this->repository->countTreeConnectionsByStatus('accepted'),
            'pending_tree_connections' => $this->repository->countTreeConnectionsByStatus('pending'),
        ];
    }

    /**
     * Format tree for list view
     */
    private function formatTreeForList($tree): array
    {
        return [
            'id' => $tree->id,
            'uuid' => $tree->uuid,
            'tree_name' => $tree->tree_name,
            'is_public' => $tree->is_public,
            'is_nuclear_family' => $tree->is_nuclear_family,
            'members_count' => $tree->members_count,
            'admins_count' => $tree->admins_count,
            'root_user' => $tree->rootUser ? [
                'id' => $tree->rootUser->id,
                'first_name' => $tree->rootUser->first_name,
                'last_name' => $tree->rootUser->last_name,
                'full_name' => "{$tree->rootUser->first_name} {$tree->rootUser->last_name}",
                'username' => $tree->rootUser->username,
                'profile_image_url' => $tree->rootUser->profile_image_url,
            ] : null,
            'created_at' => $tree->created_at->format('Y-m-d'),
            'created_at_formatted' => $tree->created_at->diffForHumans(),
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
            // Silently fail
        }
    }
}
