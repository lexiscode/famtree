<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgGroupService;
use App\Repositories\OrgRepositories\OrgActivityLogRepository;
use App\Models\OrgModels\OrgGroupMember;
use App\Models\OrgModels\OrgGroupAutoRule;
use App\Models\GuestModels\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrgGroupController extends Controller
{
    use AuthorizesOrgActions;

    public function __construct(
        private OrgGroupService $groupService,
        private OrgActivityLogRepository $activityLogRepo,
    ) {}

    /**
     * Check if account has full org group access or is linked to a specific group.
     * Returns true for full access, or the linked group ID for limited access.
     */
    private function getAccessScope(): bool|int
    {
        $orgAccount = Auth::guard('org')->user();

        // Full access via manage-org-groups permission
        if (Gate::allows('manage-org-groups')) {
            return true;
        }

        // Limited access via linked org group (SUG leaders etc.)
        if ($orgAccount->linked_org_group_id) {
            return $orgAccount->linked_org_group_id;
        }

        abort(403);
    }

    public function index()
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        $allGroups = $this->groupService->getGroups($orgAccount->organization_id);

        // Filter to only linked group if limited access
        $groups = is_int($scope)
            ? $allGroups->filter(fn($g) => $g->id === $scope)->values()
            : $allGroups;

        $groupsData = $groups->map(function ($group) {
            return [
                'id' => $group->id,
                'uuid' => $group->uuid,
                'name' => $group->name,
                'slug' => $group->slug,
                'description' => $group->description,
                'type' => $group->type,
                'is_active' => $group->is_active,
                'max_members' => $group->max_members,
                'allow_join_requests' => $group->allow_join_requests,
                'is_suspended' => $group->is_suspended,
                'suspension_reason' => $group->suspension_reason,
                'active_members_count' => $group->active_members_count,
                'pending_join_requests_count' => $group->pending_join_requests_count ?? 0,
                'members' => $group->activeMembers->map(fn($m) => [
                    'id' => $m->id,
                    'user_id' => $m->user->id,
                    'uuid' => $m->user->uuid,
                    'first_name' => $m->user->first_name,
                    'last_name' => $m->user->last_name,
                    'username' => $m->user->username,
                    'profile_image' => $m->user->profile_image_url,
                    'role' => $m->role,
                    'role_label' => OrgGroupMember::roleLabel($m->role),
                    'is_leader' => $m->isLeader(),
                    'joined_at' => $m->joined_at?->toDateTimeString(),
                ])->toArray(),
                'created_at' => $group->created_at->toDateTimeString(),
            ];
        });

        return Inertia::render('OrgPages/OrgGroups/Index', [
            'groups' => $groupsData,
            'isLimitedAccess' => is_int($scope),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'required|in:sug,faculty_union,hall_committee,departmental_rep,custom',
            'max_members' => 'nullable|integer|min:2',
            'allow_join_requests' => 'sometimes|boolean',
        ]);

        $group = $this->groupService->createGroup([
            'organization_id' => $orgAccount->organization_id,
            'created_by' => $orgAccount->id,
            ...$validated,
        ]);

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_created',
            'resource_type' => 'org_group',
            'description' => "Created org group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', "Group \"{$group->name}\" created successfully.");
    }

    public function update(Request $request, int $id)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'type' => 'sometimes|required|in:sug,faculty_union,hall_committee,departmental_rep,custom',
            'is_active' => 'sometimes|boolean',
            'max_members' => 'nullable|integer|min:2',
            'allow_join_requests' => 'sometimes|boolean',
        ]);

        $group = $this->groupService->updateGroup($id, $orgAccount->organization_id, $validated);

        if (!$group) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_updated',
            'resource_type' => 'org_group',
            'description' => "Updated org group: {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', "Group \"{$group->name}\" updated successfully.");
    }

    public function destroy(Request $request, int $id)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($id);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $groupName = $group->name;
        $this->groupService->deleteGroup($id, $orgAccount->organization_id);

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_deleted',
            'resource_type' => 'org_group',
            'description' => "Deleted org group: {$groupName}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', "Group \"{$groupName}\" deleted successfully.");
    }

    public function addMember(Request $request, int $groupId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        // Linked users can only add to their own group
        if (is_int($scope) && $scope !== $groupId) {
            return redirect()->back()->with('error', 'You can only manage your own group.');
        }

        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
            'role' => 'required|in:president,vice_president,secretary,treasurer,pro,social_director,member',
        ]);

        // Linked users (leaders) can only add regular members, not assign leadership roles
        if (is_int($scope) && $validated['role'] !== 'member') {
            return redirect()->back()->with('error', 'You can only add regular members to the group.');
        }

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $addedByType = is_int($scope) ? 'leader' : 'org_staff';

        $result = $this->groupService->addMember(
            $groupId,
            $validated['user_id'],
            $validated['role'],
            $addedByType,
            $orgAccount->id
        );

        if ($result === 'user_banned') {
            return redirect()->back()->with('error', 'This user is banned from the group.');
        }

        if ($result === 'max_members_reached') {
            return redirect()->back()->with('error', 'Maximum member limit reached for this group.');
        }

        if ($result === 'role_taken') {
            $roleLabel = OrgGroupMember::roleLabel($validated['role']);
            return redirect()->back()->with('error', "The {$roleLabel} role is already assigned to another member.");
        }

        if (!$result) {
            return redirect()->back()->with('error', 'Failed to add member.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_member_added',
            'resource_type' => 'org_group',
            'description' => "Added member to {$group->name} as " . OrgGroupMember::roleLabel($validated['role']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Member added successfully.');
    }

    public function removeMember(Request $request, int $groupId, int $userId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        if (is_int($scope) && $scope !== $groupId) {
            return redirect()->back()->with('error', 'You can only manage your own group.');
        }

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        if (!$this->groupService->removeMember($groupId, $userId)) {
            return redirect()->back()->with('error', 'Member not found in this group.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_member_removed',
            'resource_type' => 'org_group',
            'description' => "Removed member from {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Member removed successfully.');
    }

    public function updateMemberRole(Request $request, int $groupId, int $userId)
    {
        // Only full access can change roles
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'role' => 'required|in:president,vice_president,secretary,treasurer,pro,social_director,member',
        ]);

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $result = $this->groupService->updateMemberRole($groupId, $userId, $validated['role']);

        if ($result === 'role_taken') {
            $roleLabel = OrgGroupMember::roleLabel($validated['role']);
            return redirect()->back()->with('error', "The {$roleLabel} role is already assigned to another member.");
        }

        if (!$result) {
            return redirect()->back()->with('error', 'Member not found.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_role_changed',
            'resource_type' => 'org_group',
            'description' => "Changed member role in {$group->name} to " . OrgGroupMember::roleLabel($validated['role']),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Member role updated successfully.');
    }

    public function handover(Request $request, int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'term_name' => 'required|string|max:100',
            'notes' => 'nullable|string|max:2000',
        ]);

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->groupService->handoverLeadership($groupId, $validated['term_name'], $validated['notes']);

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_handover',
            'resource_type' => 'org_group',
            'description' => "Initiated leadership handover for {$group->name} (Term: {$validated['term_name']})",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Leadership handover completed. All leaders have been demoted to members. You can now assign new leaders.');
    }

    public function termHistory(int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $terms = $this->groupService->getTermHistory($groupId);

        $termsData = $terms->map(fn($t) => [
            'id' => $t->id,
            'user' => [
                'id' => $t->user->id,
                'first_name' => $t->user->first_name,
                'last_name' => $t->user->last_name,
                'username' => $t->user->username,
                'profile_image' => $t->user->profile_image_url,
            ],
            'role' => $t->role,
            'role_label' => OrgGroupMember::roleLabel($t->role),
            'term_name' => $t->term_name,
            'started_at' => $t->started_at?->toDateTimeString(),
            'ended_at' => $t->ended_at?->toDateTimeString(),
            'is_current' => $t->is_current,
            'handover_notes' => $t->handover_notes,
        ]);

        return response()->json([
            'group' => ['id' => $group->id, 'name' => $group->name],
            'terms' => $termsData,
        ]);
    }

    public function searchUsers(Request $request, int $groupId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        if (is_int($scope) && $scope !== $groupId) {
            return response()->json([]);
        }

        $query = $request->get('q', '');
        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return response()->json([]);
        }

        $users = $this->groupService->searchEligibleUsers($orgAccount->organization_id, $query, $groupId);

        return response()->json($users->map(fn($u) => [
            'id' => $u->id,
            'uuid' => $u->uuid,
            'first_name' => $u->first_name,
            'last_name' => $u->last_name,
            'username' => $u->username,
            'profile_image' => $u->profile_image_url,
        ]));
    }

    // ─── Join Requests ────────────────────────────────────────────

    public function joinRequests(int $groupId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        if (is_int($scope) && $scope !== $groupId) {
            return response()->json([]);
        }

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return response()->json([]);
        }

        $requests = $this->groupService->getJoinRequests($groupId);

        return response()->json($requests->map(fn($r) => [
            'id' => $r->id,
            'user' => [
                'id' => $r->user->id,
                'uuid' => $r->user->uuid,
                'first_name' => $r->user->first_name,
                'last_name' => $r->user->last_name,
                'username' => $r->user->username,
                'profile_image' => $r->user->profile_image_url ?? null,
            ],
            'message' => $r->message,
            'created_at' => $r->created_at->toDateTimeString(),
        ]));
    }

    public function approveJoinRequest(Request $request, int $groupId, int $requestId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        if (is_int($scope) && $scope !== $groupId) {
            return redirect()->back()->with('error', 'You can only manage your own group.');
        }

        $result = $this->groupService->approveJoinRequest($requestId, $orgAccount->id);

        if ($result === 'user_banned') {
            return redirect()->back()->with('error', 'This user is banned from the group.');
        }

        if ($result === 'max_members_reached') {
            return redirect()->back()->with('error', 'Maximum member limit reached.');
        }

        if (!$result) {
            return redirect()->back()->with('error', 'Request not found or already processed.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_join_approved',
            'resource_type' => 'org_group',
            'description' => "Approved join request for group #{$groupId}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Join request approved.');
    }

    public function rejectJoinRequest(Request $request, int $groupId, int $requestId)
    {
        $scope = $this->getAccessScope();
        $orgAccount = Auth::guard('org')->user();

        if (is_int($scope) && $scope !== $groupId) {
            return redirect()->back()->with('error', 'You can only manage your own group.');
        }

        $validated = $request->validate([
            'review_note' => 'nullable|string|max:500',
        ]);

        if (!$this->groupService->rejectJoinRequest($requestId, $orgAccount->id, $validated['review_note'] ?? null)) {
            return redirect()->back()->with('error', 'Request not found or already processed.');
        }

        return redirect()->back()->with('success', 'Join request rejected.');
    }

    // ─── Bans ─────────────────────────────────────────────────────

    public function getBans(int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return response()->json([]);
        }

        $bans = $this->groupService->getBans($groupId);

        return response()->json($bans->map(fn($b) => [
            'id' => $b->id,
            'user' => [
                'id' => $b->user->id,
                'uuid' => $b->user->uuid,
                'first_name' => $b->user->first_name,
                'last_name' => $b->user->last_name,
                'username' => $b->user->username,
                'profile_image' => $b->user->profile_image_url ?? null,
            ],
            'reason' => $b->reason,
            'banned_at' => $b->banned_at->toDateTimeString(),
            'expires_at' => $b->expires_at?->toDateTimeString(),
            'is_active' => $b->isActive(),
        ]));
    }

    public function banMember(Request $request, int $groupId, int $userId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'reason' => 'required|string|max:500',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->groupService->banMember(
            $groupId,
            $userId,
            $orgAccount->id,
            $validated['reason'],
            $validated['expires_at'] ?? null
        );

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_member_banned',
            'resource_type' => 'org_group',
            'description' => "Banned member from {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Member banned and removed from group.');
    }

    public function unbanMember(Request $request, int $groupId, int $userId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        if (!$this->groupService->unbanMember($groupId, $userId)) {
            return redirect()->back()->with('error', 'Ban not found.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_member_unbanned',
            'resource_type' => 'org_group',
            'description' => "Unbanned member from {$group->name}",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Member unbanned.');
    }

    // ─── Auto-Membership Rules ────────────────────────────────────

    public function getAutoRules(int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return response()->json([]);
        }

        $rules = $this->groupService->getAutoRules($groupId);

        return response()->json($rules->map(fn($r) => [
            'id' => $r->id,
            'rule_type' => $r->rule_type,
            'rule_type_label' => OrgGroupAutoRule::RULE_TYPES[$r->rule_type] ?? $r->rule_type,
            'target_id' => $r->target_id,
            'target_name' => $r->target_name,
            'is_active' => $r->is_active,
            'last_run_count' => $r->last_run_count,
            'last_run_at' => $r->last_run_at?->toDateTimeString(),
        ]));
    }

    public function createAutoRule(Request $request, int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'rule_type' => 'required|in:class_set,faculty,all_followers',
            'target_id' => 'nullable|integer',
            'target_name' => 'nullable|string|max:255',
        ]);

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->groupService->createAutoRule($groupId, [
            ...$validated,
            'created_by' => $orgAccount->id,
        ]);

        return redirect()->back()->with('success', 'Auto-membership rule created.');
    }

    public function deleteAutoRule(Request $request, int $groupId, int $ruleId)
    {
        $this->authorizeOrg('manage-org-groups');

        if (!$this->groupService->deleteAutoRule($ruleId, $groupId)) {
            return redirect()->back()->with('error', 'Rule not found.');
        }

        return redirect()->back()->with('success', 'Auto-membership rule deleted.');
    }

    public function executeAutoRule(Request $request, int $groupId, int $ruleId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $group = $this->groupService->getGroup($groupId);
        if (!$group || $group->organization_id !== $orgAccount->organization_id) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $addedCount = $this->groupService->executeAutoRule($ruleId, $orgAccount->organization_id);

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'org_group_auto_rule_executed',
            'resource_type' => 'org_group',
            'description' => "Executed auto-membership rule for {$group->name}, added {$addedCount} members",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', "Auto-rule executed. {$addedCount} member" . ($addedCount !== 1 ? 's' : '') . " added.");
    }

    public function getAutoRuleTargets(Request $request, int $groupId)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $ruleType = $request->get('rule_type');
        $org = Organization::with('faculties.departments.classSets')->find($orgAccount->organization_id);

        if (!$org) return response()->json([]);

        $targets = [];

        if ($ruleType === 'class_set') {
            foreach ($org->faculties as $faculty) {
                foreach ($faculty->departments as $dept) {
                    foreach ($dept->classSets as $cs) {
                        $targets[] = [
                            'id' => $cs->id,
                            'name' => $cs->name . ' (' . $faculty->name . ' / ' . $dept->name . ')',
                        ];
                    }
                }
            }
        } elseif ($ruleType === 'faculty') {
            foreach ($org->faculties as $faculty) {
                $targets[] = [
                    'id' => $faculty->id,
                    'name' => $faculty->name,
                ];
            }
        }

        return response()->json($targets);
    }

    // ─── Suspension ──────────────────────────────────────────────

    public function suspend(Request $request, int $id)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $result = $this->groupService->suspendGroup(
            $id, $orgAccount->organization_id,
            $request->input('reason'), $orgAccount->id
        );

        if (!$result) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'group_suspended',
            'resource_type' => 'org_group',
            'resource_id' => $id,
            'description' => 'Suspended group. Reason: ' . $request->input('reason'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Group suspended successfully.');
    }

    public function unsuspend(int $id)
    {
        $this->authorizeOrg('manage-org-groups');
        $orgAccount = Auth::guard('org')->user();

        $result = $this->groupService->unsuspendGroup($id, $orgAccount->organization_id);

        if (!$result) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'group_unsuspended',
            'resource_type' => 'org_group',
            'resource_id' => $id,
            'description' => 'Unsuspended group',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Group unsuspended.');
    }
}
