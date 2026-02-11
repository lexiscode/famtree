<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgBroadcast;
use Illuminate\Pagination\LengthAwarePaginator;

class OrgBroadcastRepository
{
    public function getByOrganization(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return OrgBroadcast::where('organization_id', $organizationId)
            ->with('creator')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function findById(int $id): ?OrgBroadcast
    {
        return OrgBroadcast::with('creator')->find($id);
    }

    public function create(array $data): OrgBroadcast
    {
        return OrgBroadcast::create($data);
    }

    public function update(int $id, array $data): ?OrgBroadcast
    {
        $broadcast = OrgBroadcast::findOrFail($id);
        $broadcast->update($data);
        return $broadcast->fresh();
    }

    public function countByOrganization(int $organizationId): int
    {
        return OrgBroadcast::where('organization_id', $organizationId)->count();
    }

    public function countSentByOrganization(int $organizationId): int
    {
        return OrgBroadcast::where('organization_id', $organizationId)
            ->where('status', 'sent')
            ->count();
    }
}
