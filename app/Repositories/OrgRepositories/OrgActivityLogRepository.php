<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgActivityLog;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrgActivityLogRepository
{
    public function getRecentByOrganization(int $organizationId, int $limit = 10): Collection
    {
        return OrgActivityLog::where('organization_id', $organizationId)
            ->with('orgAccount')
            ->orderByDesc('created_at')
            ->limit($limit)
            ->get();
    }

    public function getPaginatedByOrganization(
        int $organizationId,
        int $perPage = 20,
        ?string $actionType = null,
        ?int $accountId = null,
        ?string $search = null,
        ?string $dateFrom = null,
        ?string $dateTo = null
    ): LengthAwarePaginator {
        $query = OrgActivityLog::where('organization_id', $organizationId)
            ->with('orgAccount')
            ->orderByDesc('created_at');

        if ($actionType) {
            $query->where('action_type', $actionType);
        }

        if ($accountId) {
            $query->where('org_account_id', $accountId);
        }

        if ($search) {
            $query->where('description', 'like', '%' . $search . '%');
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        return $query->paginate($perPage)->withQueryString();
    }

    public function getDistinctActionTypes(int $organizationId): array
    {
        return OrgActivityLog::where('organization_id', $organizationId)
            ->distinct()
            ->pluck('action_type')
            ->sort()
            ->values()
            ->toArray();
    }

    public function deleteOlderThan(int $days): int
    {
        return OrgActivityLog::where('created_at', '<', now()->subDays($days))->delete();
    }

    public function create(array $data): OrgActivityLog
    {
        return OrgActivityLog::create($data);
    }
}
