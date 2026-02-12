<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgRole;
use Illuminate\Support\Collection;

class OrgRoleRepository
{
    public function getByOrganization(int $organizationId): Collection
    {
        return OrgRole::where('organization_id', $organizationId)
            ->withCount('accounts')
            ->orderByDesc('is_system')
            ->orderBy('name')
            ->get();
    }

    public function findById(int $id): ?OrgRole
    {
        return OrgRole::find($id);
    }

    public function findBySlugAndOrg(string $slug, int $organizationId): ?OrgRole
    {
        return OrgRole::where('slug', $slug)
            ->where('organization_id', $organizationId)
            ->first();
    }

    public function create(array $data): OrgRole
    {
        return OrgRole::create($data);
    }

    public function update(int $id, array $data): ?OrgRole
    {
        $role = OrgRole::findOrFail($id);
        $role->update($data);
        return $role->fresh();
    }

    public function delete(int $id): bool
    {
        return OrgRole::findOrFail($id)->delete();
    }
}
