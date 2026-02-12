<?php

namespace App\Repositories\GuestRepositories;

use App\Models\OrgModels\OrganizationFollow;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrganizationFollowRepository
{
    public function follow(int $userId, int $organizationId): OrganizationFollow
    {
        return OrganizationFollow::firstOrCreate([
            'user_id' => $userId,
            'organization_id' => $organizationId,
        ]);
    }

    public function unfollow(int $userId, int $organizationId): bool
    {
        return OrganizationFollow::where('user_id', $userId)
            ->where('organization_id', $organizationId)
            ->delete() > 0;
    }

    public function isFollowing(int $userId, int $organizationId): bool
    {
        return OrganizationFollow::where('user_id', $userId)
            ->where('organization_id', $organizationId)
            ->exists();
    }

    public function getFollowedOrgIds(int $userId): Collection
    {
        return OrganizationFollow::where('user_id', $userId)
            ->pluck('organization_id');
    }

    public function getFollowersByOrganization(int $organizationId, int $perPage = 20): LengthAwarePaginator
    {
        return OrganizationFollow::where('organization_id', $organizationId)
            ->with('user')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    public function countFollowers(int $organizationId): int
    {
        return OrganizationFollow::where('organization_id', $organizationId)->count();
    }
}
