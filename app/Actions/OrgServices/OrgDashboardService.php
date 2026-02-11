<?php

namespace App\Actions\OrgServices;

use App\Repositories\GuestRepositories\OrganizationFollowRepository;
use App\Repositories\OrgRepositories\OrgPostRepository;
use App\Repositories\OrgRepositories\OrgBroadcastRepository;
use App\Repositories\OrgRepositories\OrgActivityLogRepository;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\ClassSet;
use App\Models\GuestModels\ClassSetMember;

class OrgDashboardService
{
    public function __construct(
        private OrganizationFollowRepository $followRepo,
        private OrgPostRepository $postRepo,
        private OrgBroadcastRepository $broadcastRepo,
        private OrgActivityLogRepository $activityLogRepo,
    ) {}

    public function getStats(int $organizationId): array
    {
        $org = Organization::with('faculties.departments.classSets')->findOrFail($organizationId);

        $classSetIds = [];
        foreach ($org->faculties as $faculty) {
            foreach ($faculty->departments as $dept) {
                foreach ($dept->classSets as $classSet) {
                    $classSetIds[] = $classSet->id;
                }
            }
        }

        $totalMembers = 0;
        if (!empty($classSetIds)) {
            $totalMembers = ClassSetMember::whereIn('class_set_id', $classSetIds)->count();
        }

        return [
            'followers' => $this->followRepo->countFollowers($organizationId),
            'posts' => $this->postRepo->countByOrganization($organizationId),
            'broadcastsSent' => $this->broadcastRepo->countSentByOrganization($organizationId),
            'activeGroups' => count($classSetIds),
            'totalMembers' => $totalMembers,
        ];
    }

    public function getRecentActivity(int $organizationId, int $limit = 10): array
    {
        return $this->activityLogRepo->getRecentByOrganization($organizationId, $limit)
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action_type,
                    'description' => $log->description,
                    'account' => $log->orgAccount ? $log->orgAccount->display_name ?? $log->orgAccount->username : 'System',
                    'timestamp' => $log->created_at->diffForHumans(),
                ];
            })->toArray();
    }
}
