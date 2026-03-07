<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgGroup;
use App\Models\OrgModels\OrgGroupMember;
use App\Models\OrgModels\OrgGroupLeadershipTerm;
use App\Models\OrgModels\OrgGroupJoinRequest;
use App\Models\OrgModels\OrgGroupBan;
use App\Models\OrgModels\OrgGroupAutoRule;
use App\Models\User;
use App\Models\OrgModels\OrganizationFollow;
use App\Models\GuestModels\ClassSetMember;
use App\Models\GuestModels\Organization;
use Illuminate\Support\Collection;

class OrgGroupRepository
{
    public function getByOrganization(int $organizationId)
    {
        return OrgGroup::where('organization_id', $organizationId)
            ->withCount(['activeMembers', 'pendingJoinRequests'])
            ->with(['activeMembers' => function ($q) {
                $q->with('user:id,uuid,first_name,last_name,username,profile_image')
                    ->orderByRaw("FIELD(role, 'president', 'vice_president', 'secretary', 'treasurer', 'pro', 'social_director', 'member')");
            }])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int $id)
    {
        return OrgGroup::with(['activeMembers' => function ($q) {
            $q->with('user:id,uuid,first_name,last_name,username,profile_image')
                ->orderByRaw("FIELD(role, 'president', 'vice_president', 'secretary', 'treasurer', 'pro', 'social_director', 'member')");
        }])->find($id);
    }

    public function create(array $data): OrgGroup
    {
        return OrgGroup::create($data);
    }

    public function update(int $id, array $data): ?OrgGroup
    {
        $group = OrgGroup::find($id);
        if (!$group) return null;
        $group->update($data);
        return $group->fresh();
    }

    public function delete(int $id): bool
    {
        $group = OrgGroup::find($id);
        if (!$group) return false;
        return $group->delete();
    }

    public function addMember(int $groupId, int $userId, string $role = 'member', string $addedByType = 'org_staff', ?int $addedById = null): ?OrgGroupMember
    {
        $existing = OrgGroupMember::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) {
            $existing->update(['is_active' => true, 'role' => $role]);
            return $existing;
        }

        return OrgGroupMember::create([
            'org_group_id' => $groupId,
            'user_id' => $userId,
            'role' => $role,
            'added_by_type' => $addedByType,
            'added_by_id' => $addedById,
        ]);
    }

    public function removeMember(int $groupId, int $userId): bool
    {
        return OrgGroupMember::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function updateMemberRole(int $groupId, int $userId, string $role): bool
    {
        return OrgGroupMember::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->update(['role' => $role]) > 0;
    }

    public function getMember(int $groupId, int $userId): ?OrgGroupMember
    {
        return OrgGroupMember::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->first();
    }

    public function getMemberCount(int $groupId): int
    {
        return OrgGroupMember::where('org_group_id', $groupId)
            ->where('is_active', true)
            ->count();
    }

    public function hasRole(int $groupId, string $role): bool
    {
        return OrgGroupMember::where('org_group_id', $groupId)
            ->where('role', $role)
            ->where('is_active', true)
            ->exists();
    }

    // Leadership terms

    public function createLeadershipTerm(array $data): OrgGroupLeadershipTerm
    {
        return OrgGroupLeadershipTerm::create($data);
    }

    public function endCurrentTerm(int $groupId, int $userId, string $role): void
    {
        OrgGroupLeadershipTerm::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->where('role', $role)
            ->where('is_current', true)
            ->update([
                'is_current' => false,
                'ended_at' => now(),
            ]);
    }

    public function endAllCurrentTerms(int $groupId): void
    {
        OrgGroupLeadershipTerm::where('org_group_id', $groupId)
            ->where('is_current', true)
            ->update([
                'is_current' => false,
                'ended_at' => now(),
            ]);
    }

    public function getTermHistory(int $groupId)
    {
        return OrgGroupLeadershipTerm::where('org_group_id', $groupId)
            ->with('user:id,uuid,first_name,last_name,username,profile_image')
            ->orderBy('started_at', 'desc')
            ->get();
    }

    // User search

    public function searchEligibleUsers(int $organizationId, string $query, int $groupId, int $limit = 20)
    {
        $followerIds = OrganizationFollow::where('organization_id', $organizationId)
            ->pluck('user_id');

        $org = Organization::with('faculties.departments.classSets')->find($organizationId);
        $classSetIds = [];
        if ($org) {
            foreach ($org->faculties as $faculty) {
                foreach ($faculty->departments as $dept) {
                    foreach ($dept->classSets as $classSet) {
                        $classSetIds[] = $classSet->id;
                    }
                }
            }
        }
        $classSetMemberIds = ClassSetMember::whereIn('class_set_id', $classSetIds)
            ->pluck('user_id');

        $eligibleIds = $followerIds->merge($classSetMemberIds)->unique();

        $existingMemberIds = OrgGroupMember::where('org_group_id', $groupId)
            ->where('is_active', true)
            ->pluck('user_id');

        // Also exclude banned users
        $bannedIds = OrgGroupBan::where('org_group_id', $groupId)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->pluck('user_id');

        $eligibleIds = $eligibleIds->diff($existingMemberIds)->diff($bannedIds);

        if ($eligibleIds->isEmpty()) {
            return collect();
        }

        return User::whereIn('id', $eligibleIds)
            ->where(function ($q) use ($query) {
                $q->where('username', 'like', "%{$query}%")
                    ->orWhere('first_name', 'like', "%{$query}%")
                    ->orWhere('last_name', 'like', "%{$query}%");
            })
            ->select('id', 'uuid', 'first_name', 'last_name', 'username', 'profile_image')
            ->limit($limit)
            ->get();
    }

    // Join requests

    public function getJoinRequests(int $groupId, string $status = 'pending'): Collection
    {
        return OrgGroupJoinRequest::where('org_group_id', $groupId)
            ->where('status', $status)
            ->with('user:id,uuid,first_name,last_name,username,profile_image')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findJoinRequest(int $requestId): ?OrgGroupJoinRequest
    {
        return OrgGroupJoinRequest::with('user:id,uuid,first_name,last_name,username,profile_image')->find($requestId);
    }

    public function hasPendingRequest(int $groupId, int $userId): bool
    {
        return OrgGroupJoinRequest::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->where('status', 'pending')
            ->exists();
    }

    public function createJoinRequest(array $data): OrgGroupJoinRequest
    {
        return OrgGroupJoinRequest::create($data);
    }

    public function updateJoinRequest(int $requestId, array $data): ?OrgGroupJoinRequest
    {
        $request = OrgGroupJoinRequest::find($requestId);
        if (!$request) return null;
        $request->update($data);
        return $request->fresh();
    }

    // Bans

    public function getBans(int $groupId): Collection
    {
        return OrgGroupBan::where('org_group_id', $groupId)
            ->with(['user:id,uuid,first_name,last_name,username,profile_image', 'banner'])
            ->orderBy('banned_at', 'desc')
            ->get();
    }

    public function isBanned(int $groupId, int $userId): bool
    {
        return OrgGroupBan::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->exists();
    }

    public function createBan(array $data): OrgGroupBan
    {
        // Remove any existing ban first (to replace)
        OrgGroupBan::where('org_group_id', $data['org_group_id'])
            ->where('user_id', $data['user_id'])
            ->delete();

        return OrgGroupBan::create($data);
    }

    public function removeBan(int $groupId, int $userId): bool
    {
        return OrgGroupBan::where('org_group_id', $groupId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    // Auto-membership rules

    public function getAutoRules(int $groupId): Collection
    {
        return OrgGroupAutoRule::where('org_group_id', $groupId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function createAutoRule(array $data): OrgGroupAutoRule
    {
        return OrgGroupAutoRule::create($data);
    }

    public function deleteAutoRule(int $ruleId): bool
    {
        return OrgGroupAutoRule::where('id', $ruleId)->delete() > 0;
    }

    public function findAutoRule(int $ruleId): ?OrgGroupAutoRule
    {
        return OrgGroupAutoRule::find($ruleId);
    }

    public function updateAutoRule(int $ruleId, array $data): ?OrgGroupAutoRule
    {
        $rule = OrgGroupAutoRule::find($ruleId);
        if (!$rule) return null;
        $rule->update($data);
        return $rule->fresh();
    }

    // Get users by auto-rule criteria (for executing rules)

    public function getUsersByAutoRule(OrgGroupAutoRule $rule, int $organizationId, int $groupId): Collection
    {
        $existingMemberIds = OrgGroupMember::where('org_group_id', $groupId)
            ->where('is_active', true)
            ->pluck('user_id');

        $bannedIds = OrgGroupBan::where('org_group_id', $groupId)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->pluck('user_id');

        $excludeIds = $existingMemberIds->merge($bannedIds)->unique();

        switch ($rule->rule_type) {
            case 'class_set':
                $userIds = ClassSetMember::where('class_set_id', $rule->target_id)
                    ->pluck('user_id');
                break;

            case 'faculty':
                $org = Organization::with('faculties.departments.classSets')->find($organizationId);
                $classSetIds = [];
                if ($org) {
                    foreach ($org->faculties as $faculty) {
                        if ($faculty->id == $rule->target_id) {
                            foreach ($faculty->departments as $dept) {
                                foreach ($dept->classSets as $cs) {
                                    $classSetIds[] = $cs->id;
                                }
                            }
                        }
                    }
                }
                $userIds = ClassSetMember::whereIn('class_set_id', $classSetIds)
                    ->pluck('user_id');
                break;

            case 'all_followers':
                $userIds = OrganizationFollow::where('organization_id', $organizationId)
                    ->pluck('user_id');
                break;

            default:
                $userIds = collect();
        }

        return User::whereIn('id', $userIds->diff($excludeIds))
            ->select('id', 'uuid', 'first_name', 'last_name', 'username')
            ->get();
    }
}
