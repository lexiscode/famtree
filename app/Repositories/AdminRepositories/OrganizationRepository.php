<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\Organization;
use App\Models\OrgModels\OrgAccount;
use Illuminate\Pagination\LengthAwarePaginator;

class OrganizationRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return Organization::with('category')
            ->withCount(['orgAccounts', 'followers', 'orgPosts', 'faculties'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function search(string $query, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return Organization::with('category')
            ->withCount(['orgAccounts', 'followers', 'orgPosts', 'faculties'])
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('short_name', 'like', "%{$query}%")
                    ->orWhere('email', 'like', "%{$query}%")
                    ->orWhere('city', 'like', "%{$query}%");
            })
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function filterByCriteria(array $filters, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = Organization::with('category')
            ->withCount(['orgAccounts', 'followers', 'orgPosts', 'faculties']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('short_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['is_active']) && $filters['is_active'] !== null) {
            $isActive = $filters['is_active'] === 'true' || $filters['is_active'] === true;
            $query->where('is_active', $isActive);
        }

        if (!empty($filters['state'])) {
            $query->where('state', $filters['state']);
        }

        if (!empty($filters['country'])) {
            $query->where('country', $filters['country']);
        }

        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?Organization
    {
        return Organization::with(['category', 'faculties.departments.classSets', 'orgAccounts.orgRole', 'followers', 'galleries'])
            ->withCount(['orgAccounts', 'followers', 'orgPosts', 'faculties'])
            ->find($id);
    }

    public function create(array $data): Organization
    {
        return Organization::create($data);
    }

    public function update(int $id, array $data): ?Organization
    {
        $org = Organization::find($id);
        if ($org) {
            $org->update($data);
        }
        return $org;
    }

    public function delete(int $id): bool
    {
        $org = Organization::find($id);
        return $org ? $org->delete() : false;
    }

    public function count(): int
    {
        return Organization::count();
    }

    public function countActive(): int
    {
        return Organization::where('is_active', true)->count();
    }

    public function countInactive(): int
    {
        return Organization::where('is_active', false)->count();
    }

    public function getStaff(int $orgId): \Illuminate\Database\Eloquent\Collection
    {
        return OrgAccount::with('orgRole')
            ->where('organization_id', $orgId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findStaff(int $staffId): ?OrgAccount
    {
        return OrgAccount::with(['orgRole', 'organization'])->find($staffId);
    }

    public function createStaff(array $data): OrgAccount
    {
        return OrgAccount::create($data);
    }
}
