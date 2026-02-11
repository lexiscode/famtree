<?php

namespace App\Actions\OrgServices;

use App\Repositories\GuestRepositories\OrganizationFollowRepository;
use Illuminate\Pagination\LengthAwarePaginator;

class OrgFollowerService
{
    public function __construct(
        private OrganizationFollowRepository $followRepo,
    ) {}

    public function getFollowers(int $organizationId, int $perPage = 20): LengthAwarePaginator
    {
        return $this->followRepo->getFollowersByOrganization($organizationId, $perPage);
    }

    public function countFollowers(int $organizationId): int
    {
        return $this->followRepo->countFollowers($organizationId);
    }
}
