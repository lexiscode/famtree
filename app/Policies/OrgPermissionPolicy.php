<?php

namespace App\Policies;

use App\Models\OrgModels\OrgAccount;

class OrgPermissionPolicy
{
    public function managePosts(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_posts');
    }

    public function manageBroadcasts(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_broadcasts');
    }

    public function manageGroupBroadcasts(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_group_broadcasts');
    }

    public function manageStaff(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_staff');
    }

    public function viewAnalytics(OrgAccount $account): bool
    {
        return $account->hasPermission('view_analytics');
    }

    public function manageGroups(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_groups');
    }

    public function manageOrgGroups(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_org_groups');
    }

    public function manageProfile(OrgAccount $account): bool
    {
        return $account->hasPermission('manage_profile');
    }
}
