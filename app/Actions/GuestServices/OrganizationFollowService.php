<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\OrganizationFollowRepository;

class OrganizationFollowService
{
    public function __construct(
        private OrganizationFollowRepository $followRepo,
    ) {}

    public function followOrganization(int $userId, int $organizationId): void
    {
        $this->followRepo->follow($userId, $organizationId);
    }

    public function unfollowOrganization(int $userId, int $organizationId): bool
    {
        return $this->followRepo->unfollow($userId, $organizationId);
    }

    public function isFollowing(int $userId, int $organizationId): bool
    {
        return $this->followRepo->isFollowing($userId, $organizationId);
    }

    public function getFollowedOrganizationIds(int $userId): array
    {
        return $this->followRepo->getFollowedOrgIds($userId)->toArray();
    }
}
