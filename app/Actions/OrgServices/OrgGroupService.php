<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgGroupRepository;
use App\Models\OrgModels\OrgGroupMember;
use App\Models\OrgModels\OrgGroupAutoRule;
use Illuminate\Support\Str;

class OrgGroupService
{
    public function __construct(private OrgGroupRepository $repo) {}

    public function getGroups(int $organizationId)
    {
        return $this->repo->getByOrganization($organizationId);
    }

    public function getGroup(int $id)
    {
        return $this->repo->findById($id);
    }

    public function createGroup(array $data)
    {
        $data['slug'] = Str::slug($data['name']);
        return $this->repo->create($data);
    }

    public function updateGroup(int $id, int $organizationId, array $data)
    {
        $group = $this->repo->findById($id);
        if (!$group || $group->organization_id !== $organizationId) {
            return null;
        }

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $this->repo->update($id, $data);
    }

    public function deleteGroup(int $id, int $organizationId): bool
    {
        $group = $this->repo->findById($id);
        if (!$group || $group->organization_id !== $organizationId) {
            return false;
        }

        return $this->repo->delete($id);
    }

    public function addMember(int $groupId, int $userId, string $role = 'member', string $addedByType = 'org_staff', ?int $addedById = null)
    {
        $group = $this->repo->findById($groupId);
        if (!$group) return null;

        // Check if user is banned
        if ($this->repo->isBanned($groupId, $userId)) {
            return 'user_banned';
        }

        // Check max members
        if ($group->max_members) {
            $currentCount = $this->repo->getMemberCount($groupId);
            if ($currentCount >= $group->max_members) {
                return 'max_members_reached';
            }
        }

        // If assigning a leadership role, check if that role is already taken
        if ($role !== 'member' && $this->repo->hasRole($groupId, $role)) {
            return 'role_taken';
        }

        $member = $this->repo->addMember($groupId, $userId, $role, $addedByType, $addedById);

        // Create leadership term if it's a leadership role
        if ($member && $role !== 'member') {
            $this->repo->createLeadershipTerm([
                'org_group_id' => $groupId,
                'user_id' => $userId,
                'role' => $role,
            ]);
        }

        return $member;
    }

    public function removeMember(int $groupId, int $userId): bool
    {
        $member = $this->repo->getMember($groupId, $userId);
        if (!$member) return false;

        // End leadership term if applicable
        if ($member->isLeader()) {
            $this->repo->endCurrentTerm($groupId, $userId, $member->role);
        }

        return $this->repo->removeMember($groupId, $userId);
    }

    public function updateMemberRole(int $groupId, int $userId, string $newRole): string|bool
    {
        $member = $this->repo->getMember($groupId, $userId);
        if (!$member) return false;

        $oldRole = $member->role;

        // If assigning a leadership role, check if it's already taken by someone else
        if ($newRole !== 'member' && $newRole !== $oldRole && $this->repo->hasRole($groupId, $newRole)) {
            return 'role_taken';
        }

        // End old leadership term
        if ($oldRole !== 'member') {
            $this->repo->endCurrentTerm($groupId, $userId, $oldRole);
        }

        // Update role
        $this->repo->updateMemberRole($groupId, $userId, $newRole);

        // Create new leadership term
        if ($newRole !== 'member') {
            $this->repo->createLeadershipTerm([
                'org_group_id' => $groupId,
                'user_id' => $userId,
                'role' => $newRole,
            ]);
        }

        return true;
    }

    public function handoverLeadership(int $groupId, string $termName, ?string $notes = null): void
    {
        $currentTerms = \App\Models\OrgModels\OrgGroupLeadershipTerm::where('org_group_id', $groupId)
            ->where('is_current', true)
            ->get();

        foreach ($currentTerms as $term) {
            $term->update([
                'is_current' => false,
                'ended_at' => now(),
                'handover_notes' => $notes,
                'term_name' => $term->term_name ?: $termName,
            ]);
        }

        OrgGroupMember::where('org_group_id', $groupId)
            ->where('role', '!=', 'member')
            ->where('is_active', true)
            ->update(['role' => 'member']);
    }

    public function getTermHistory(int $groupId)
    {
        return $this->repo->getTermHistory($groupId);
    }

    public function searchEligibleUsers(int $organizationId, string $query, int $groupId)
    {
        return $this->repo->searchEligibleUsers($organizationId, $query, $groupId);
    }

    // Join requests

    public function getJoinRequests(int $groupId, string $status = 'pending')
    {
        return $this->repo->getJoinRequests($groupId, $status);
    }

    public function approveJoinRequest(int $requestId, int $reviewedBy): string|bool
    {
        $request = $this->repo->findJoinRequest($requestId);
        if (!$request || $request->status !== 'pending') return false;

        $group = $this->repo->findById($request->org_group_id);
        if (!$group) return false;

        // Check if user is banned
        if ($this->repo->isBanned($group->id, $request->user_id)) {
            $this->repo->updateJoinRequest($requestId, [
                'status' => 'rejected',
                'reviewed_by' => $reviewedBy,
                'reviewed_at' => now(),
                'review_note' => 'User is banned from this group.',
            ]);
            return 'user_banned';
        }

        // Check max members
        if ($group->max_members) {
            $currentCount = $this->repo->getMemberCount($group->id);
            if ($currentCount >= $group->max_members) {
                return 'max_members_reached';
            }
        }

        // Add as member
        $this->repo->addMember($group->id, $request->user_id, 'member', 'join_request');

        // Update request
        $this->repo->updateJoinRequest($requestId, [
            'status' => 'approved',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
        ]);

        return true;
    }

    public function rejectJoinRequest(int $requestId, int $reviewedBy, ?string $note = null): bool
    {
        $request = $this->repo->findJoinRequest($requestId);
        if (!$request || $request->status !== 'pending') return false;

        $this->repo->updateJoinRequest($requestId, [
            'status' => 'rejected',
            'reviewed_by' => $reviewedBy,
            'reviewed_at' => now(),
            'review_note' => $note,
        ]);

        return true;
    }

    // Bans

    public function getBans(int $groupId)
    {
        return $this->repo->getBans($groupId);
    }

    public function banMember(int $groupId, int $userId, int $bannedBy, string $reason, ?string $expiresAt = null): bool
    {
        // Remove from group first
        $member = $this->repo->getMember($groupId, $userId);
        if ($member) {
            if ($member->isLeader()) {
                $this->repo->endCurrentTerm($groupId, $userId, $member->role);
            }
            $this->repo->removeMember($groupId, $userId);
        }

        // Reject any pending join requests
        $pendingRequests = $this->repo->getJoinRequests($groupId, 'pending');
        foreach ($pendingRequests as $req) {
            if ($req->user_id === $userId) {
                $this->repo->updateJoinRequest($req->id, [
                    'status' => 'rejected',
                    'reviewed_by' => $bannedBy,
                    'reviewed_at' => now(),
                    'review_note' => 'User was banned from the group.',
                ]);
            }
        }

        // Create ban
        $this->repo->createBan([
            'org_group_id' => $groupId,
            'user_id' => $userId,
            'reason' => $reason,
            'banned_by' => $bannedBy,
            'banned_at' => now(),
            'expires_at' => $expiresAt,
        ]);

        return true;
    }

    public function unbanMember(int $groupId, int $userId): bool
    {
        return $this->repo->removeBan($groupId, $userId);
    }

    // Auto-membership rules

    public function getAutoRules(int $groupId)
    {
        return $this->repo->getAutoRules($groupId);
    }

    public function createAutoRule(int $groupId, array $data)
    {
        $data['org_group_id'] = $groupId;
        return $this->repo->createAutoRule($data);
    }

    public function deleteAutoRule(int $ruleId, int $groupId): bool
    {
        $rule = $this->repo->findAutoRule($ruleId);
        if (!$rule || $rule->org_group_id !== $groupId) return false;
        return $this->repo->deleteAutoRule($ruleId);
    }

    public function executeAutoRule(int $ruleId, int $organizationId): int
    {
        $rule = $this->repo->findAutoRule($ruleId);
        if (!$rule || !$rule->is_active) return 0;

        $group = $this->repo->findById($rule->org_group_id);
        if (!$group) return 0;

        $users = $this->repo->getUsersByAutoRule($rule, $organizationId, $group->id);
        $addedCount = 0;

        foreach ($users as $user) {
            // Check max members
            if ($group->max_members) {
                $currentCount = $this->repo->getMemberCount($group->id);
                if ($currentCount >= $group->max_members) break;
            }

            $result = $this->repo->addMember($group->id, $user->id, 'member', 'auto_rule');
            if ($result) $addedCount++;
        }

        // Update rule stats
        $this->repo->updateAutoRule($ruleId, [
            'last_run_count' => $addedCount,
            'last_run_at' => now(),
        ]);

        return $addedCount;
    }

    // Suspension

    public function suspendGroup(int $id, int $organizationId, string $reason, int $suspendedBy): bool
    {
        $group = $this->repo->findById($id);
        if (!$group || $group->organization_id !== $organizationId) return false;

        $this->repo->update($id, [
            'is_suspended' => true,
            'suspension_reason' => $reason,
            'suspended_at' => now(),
            'suspended_by' => $suspendedBy,
        ]);

        return true;
    }

    public function unsuspendGroup(int $id, int $organizationId): bool
    {
        $group = $this->repo->findById($id);
        if (!$group || $group->organization_id !== $organizationId) return false;

        $this->repo->update($id, [
            'is_suspended' => false,
            'suspension_reason' => null,
            'suspended_at' => null,
            'suspended_by' => null,
        ]);

        return true;
    }
}
