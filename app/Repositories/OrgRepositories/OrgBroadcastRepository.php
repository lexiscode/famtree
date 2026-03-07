<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgBroadcast;
use App\Models\OrgModels\OrgBroadcastRead;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrgBroadcastRepository
{
    public function getByOrganization(int $organizationId, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = OrgBroadcast::where('organization_id', $organizationId)
            ->with('creator');

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['approval_status'])) {
            $query->where('approval_status', $filters['approval_status']);
        }

        if (isset($filters['is_flagged'])) {
            $query->where('is_flagged', (bool)$filters['is_flagged']);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function findById(int $id): ?OrgBroadcast
    {
        return OrgBroadcast::with(['creator', 'approver', 'flagger'])->find($id);
    }

    public function create(array $data): OrgBroadcast
    {
        return OrgBroadcast::create($data);
    }

    public function update(int $id, array $data): ?OrgBroadcast
    {
        $broadcast = OrgBroadcast::findOrFail($id);
        $broadcast->update($data);
        return $broadcast->fresh(['creator', 'approver', 'flagger']);
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

    public function getPendingApproval(int $organizationId): Collection
    {
        return OrgBroadcast::where('organization_id', $organizationId)
            ->where('requires_approval', true)
            ->where('approval_status', 'pending')
            ->with('creator')
            ->orderByDesc('created_at')
            ->get();
    }

    public function getFlaggedBroadcasts(int $organizationId): Collection
    {
        return OrgBroadcast::where('organization_id', $organizationId)
            ->where('is_flagged', true)
            ->with(['creator', 'flagger'])
            ->orderByDesc('flagged_at')
            ->get();
    }

    // Read receipts
    public function recordRead(int $broadcastId, int $classSetId, int $userId): OrgBroadcastRead
    {
        return OrgBroadcastRead::updateOrCreate(
            ['org_broadcast_id' => $broadcastId, 'user_id' => $userId],
            ['class_set_id' => $classSetId, 'read_at' => now()],
        );
    }

    public function getReadCount(int $broadcastId): int
    {
        return OrgBroadcastRead::where('org_broadcast_id', $broadcastId)->count();
    }

    public function getReadsByClassSet(int $broadcastId): Collection
    {
        return OrgBroadcastRead::where('org_broadcast_id', $broadcastId)
            ->selectRaw('class_set_id, COUNT(*) as read_count')
            ->groupBy('class_set_id')
            ->get();
    }

    public function getRecentReads(int $broadcastId, int $limit = 50): Collection
    {
        return OrgBroadcastRead::where('org_broadcast_id', $broadcastId)
            ->with('user:id,first_name,last_name,username,profile_image')
            ->orderByDesc('read_at')
            ->limit($limit)
            ->get();
    }

    public function countPendingApproval(int $organizationId): int
    {
        return OrgBroadcast::where('organization_id', $organizationId)
            ->where('requires_approval', true)
            ->where('approval_status', 'pending')
            ->count();
    }
}
