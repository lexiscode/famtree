<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgPost;
use Illuminate\Pagination\LengthAwarePaginator;

class OrgPostRepository
{
    public function getByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return OrgPost::where('organization_id', $organizationId)
            ->with(['creator', 'images'])
            ->orderByDesc('is_pinned')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?OrgPost
    {
        return OrgPost::with(['creator', 'images'])->find($id);
    }

    public function create(array $data): OrgPost
    {
        return OrgPost::create($data);
    }

    public function update(int $id, array $data): ?OrgPost
    {
        $post = OrgPost::findOrFail($id);
        $post->update($data);
        return $post->fresh();
    }

    public function delete(int $id): bool
    {
        return OrgPost::findOrFail($id)->delete();
    }

    public function countByOrganization(int $organizationId): int
    {
        return OrgPost::where('organization_id', $organizationId)->count();
    }

    public function getByOrganizationIds(array $organizationIds, int $limit = 20, int $offset = 0)
    {
        return OrgPost::whereIn('organization_id', $organizationIds)
            ->with(['organization', 'creator', 'images'])
            ->orderByDesc('created_at')
            ->offset($offset)
            ->limit($limit)
            ->get();
    }

    public function togglePin(int $id): OrgPost
    {
        $post = OrgPost::findOrFail($id);
        $post->update(['is_pinned' => !$post->is_pinned]);
        return $post->fresh();
    }
}
