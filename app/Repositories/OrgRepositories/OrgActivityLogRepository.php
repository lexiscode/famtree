<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgActivityLog;
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

    public function create(array $data): OrgActivityLog
    {
        return OrgActivityLog::create($data);
    }
}
