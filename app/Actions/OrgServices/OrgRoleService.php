<?php

namespace App\Actions\OrgServices;

use App\Models\OrgModels\OrgRole;
use App\Repositories\OrgRepositories\OrgRoleRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class OrgRoleService
{
    public function __construct(
        private OrgRoleRepository $roleRepo,
    ) {}

    public function getRoles(int $organizationId): Collection
    {
        return $this->roleRepo->getByOrganization($organizationId);
    }

    public function getNonSystemRoles(int $organizationId): Collection
    {
        return $this->roleRepo->getByOrganization($organizationId)
            ->where('is_system', false)
            ->values();
    }

    public function createRole(int $organizationId, array $data): OrgRole
    {
        $slug = Str::slug($data['name']);

        // Ensure slug uniqueness within org
        $existing = $this->roleRepo->findBySlugAndOrg($slug, $organizationId);
        if ($existing) {
            $slug .= '-' . time();
        }

        return $this->roleRepo->create([
            'organization_id' => $organizationId,
            'name' => $data['name'],
            'slug' => $slug,
            'is_system' => false,
            'permissions' => $data['permissions'] ?? [],
            'broadcast_year_limit' => $data['broadcast_year_limit'] ?? null,
        ]);
    }

    public function updateRole(int $id, int $organizationId, array $data): ?OrgRole
    {
        $role = $this->roleRepo->findById($id);

        if (!$role || $role->organization_id !== $organizationId) {
            return null;
        }

        if ($role->is_system) {
            return null;
        }

        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
            $slug = Str::slug($data['name']);
            $existing = $this->roleRepo->findBySlugAndOrg($slug, $organizationId);
            if (!$existing || $existing->id === $id) {
                $updateData['slug'] = $slug;
            } else {
                $updateData['slug'] = $slug . '-' . time();
            }
        }

        if (array_key_exists('permissions', $data)) {
            $updateData['permissions'] = $data['permissions'] ?? [];
        }

        if (array_key_exists('broadcast_year_limit', $data)) {
            $updateData['broadcast_year_limit'] = $data['broadcast_year_limit'];
        }

        return $this->roleRepo->update($id, $updateData);
    }

    public function deleteRole(int $id, int $organizationId): string|true
    {
        $role = $this->roleRepo->findById($id);

        if (!$role || $role->organization_id !== $organizationId) {
            return 'Role not found.';
        }

        if ($role->is_system) {
            return 'System roles cannot be deleted.';
        }

        $accountCount = $role->accounts()->count();
        if ($accountCount > 0) {
            return "Cannot delete role with {$accountCount} assigned staff member(s). Reassign them first.";
        }

        $this->roleRepo->delete($id);
        return true;
    }
}
