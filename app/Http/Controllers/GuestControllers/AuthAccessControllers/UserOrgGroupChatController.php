<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgGroupMessageService;
use App\Actions\OrgServices\OrgGroupPollService;
use App\Actions\OrgServices\OrgGroupService;
use App\Repositories\OrgRepositories\OrgGroupRepository;
use App\Repositories\OrgRepositories\OrgGroupMessageRepository;
use App\Models\OrgModels\OrgGroup;
use App\Models\OrgModels\OrgGroupMember;
use App\Models\OrgModels\OrgGroupMessage;
use Illuminate\Http\Request;

class UserOrgGroupChatController extends Controller
{
    public function __construct(
        private OrgGroupMessageService $messageService,
        private OrgGroupPollService $pollService,
        private OrgGroupService $groupService,
        private OrgGroupRepository $groupRepo,
        private OrgGroupMessageRepository $messageRepo,
    ) {}

    private function getGroupByUuid(string $uuid): ?OrgGroup
    {
        return OrgGroup::where('uuid', $uuid)->first();
    }

    private function verifyMembership(int $groupId, int $userId): bool
    {
        $member = $this->groupRepo->getMember($groupId, $userId);
        return $member !== null;
    }

    /**
     * Get messages for a group chat (for AJAX loading).
     */
    public function getMessages(Request $request, string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $beforeId = $request->query('before_id');
        $afterId = $request->query('after_id');

        if ($afterId) {
            $messages = $this->messageService->getNewMessages($group->id, (int) $afterId);
        } else {
            $messages = $this->messageService->getMessages($group->id, 50, $beforeId ? (int) $beforeId : null);
        }

        return response()->json([
            'messages' => $messages->map(fn($m) => $this->formatMessage($m, $user->id)),
        ]);
    }

    /**
     * Send a message.
     */
    public function sendMessage(Request $request, string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        if ($group->is_suspended) {
            return response()->json(['error' => 'This group is suspended.'], 403);
        }

        $request->validate([
            'message' => 'required_without:attachment|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:org_group_messages,id',
            'attachment' => 'nullable|file|max:10240',
        ]);

        $data = [
            'message' => $request->input('message'),
            'reply_to_id' => $request->input('reply_to_id'),
        ];

        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('org-group-attachments', 'public');
            $data['attachment_url'] = '/storage/' . $path;
            $data['attachment_name'] = $file->getClientOriginalName();
            $ext = strtolower($file->getClientOriginalExtension());
            $data['message_type'] = in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'webp']) ? 'image' : 'file';
        }

        $result = $this->messageService->sendMessage($group->id, $user->id, $data);

        if ($result === null) {
            return response()->json(['error' => 'Group not found.'], 404);
        }
        if ($result === 'not_member') {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $message = $result->load([
            'user:id,uuid,first_name,last_name,username,profile_image',
            'replyTo' => function ($q) {
                $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
            },
        ]);

        return response()->json([
            'message' => $this->formatMessage($message, $user->id),
        ]);
    }

    /**
     * Delete a message.
     */
    public function deleteMessage(int $messageId)
    {
        $user = auth()->user();
        $message = $this->messageRepo->findById($messageId);
        if (!$message) return response()->json(['error' => 'Not found.'], 404);

        if (!$this->verifyMembership($message->org_group_id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $result = $this->messageService->deleteMessage($messageId, $user->id, false);

        if ($result === false) return response()->json(['error' => 'Not found.'], 404);
        if ($result === 'unauthorized') return response()->json(['error' => 'Not authorized.'], 403);

        return response()->json(['success' => true]);
    }

    /**
     * Edit a message.
     */
    public function editMessage(Request $request, int $messageId)
    {
        $user = auth()->user();
        $message = OrgGroupMessage::find($messageId);
        if (!$message) return response()->json(['error' => 'Not found.'], 404);

        if ($message->user_id !== $user->id) {
            return response()->json(['error' => 'Not authorized.'], 403);
        }

        $request->validate(['message' => 'required|string|max:5000']);

        $message->update([
            'message' => $request->input('message'),
        ]);

        return response()->json(['success' => true, 'message' => $this->formatMessage($message->fresh()->load([
            'user:id,uuid,first_name,last_name,username,profile_image',
            'replyTo' => fn($q) => $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image'),
        ]), $user->id)]);
    }

    /**
     * Bulk delete messages.
     */
    public function bulkDeleteMessages(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer',
        ]);

        $deleted = 0;
        foreach ($validated['message_ids'] as $messageId) {
            $message = OrgGroupMessage::find($messageId);
            if ($message && $message->user_id === $user->id) {
                $message->delete();
                $deleted++;
            }
        }

        return response()->json(['success' => true, 'deleted_count' => $deleted]);
    }

    /**
     * Toggle pin on a message.
     */
    public function togglePin(string $groupUuid, int $messageId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $result = $this->messageService->togglePin($messageId, $user->id);
        if ($result === false) return response()->json(['error' => 'Not found.'], 404);

        return response()->json($result);
    }

    /**
     * Get group members.
     */
    public function getMembers(string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $group = $this->groupRepo->findById($group->id);

        $myMember = $group->activeMembers->first(fn($m) => $m->user_id === $user->id);

        return response()->json([
            'members' => $group->activeMembers->map(fn($m) => [
                'id' => $m->user_id,
                'uuid' => $m->user->uuid,
                'first_name' => $m->user->first_name,
                'last_name' => $m->user->last_name,
                'username' => $m->user->username,
                'profile_image' => $m->user->profile_image_url,
                'is_admin' => $m->isLeader(),
                'role' => $m->role,
                'joined_at' => $m->created_at->toISOString(),
            ]),
            'my_role' => $myMember?->role,
            'is_leader' => $myMember && in_array($myMember->role, ['president', 'vice_president']),
        ]);
    }

    /**
     * Get pinned messages.
     */
    public function getPinnedMessages(string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $pinned = $this->messageService->getPinnedMessages($group->id);

        return response()->json([
            'messages' => $pinned->map(fn($m) => $this->formatMessage($m, $user->id)),
        ]);
    }

    // ─── Polls ────────────────────────────────────────────────

    public function getPolls(string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $polls = $this->pollService->getPolls($group->id);
        return response()->json($polls->map(fn($p) => $this->formatPoll($p, $user->id)));
    }

    public function createPoll(Request $request, string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $request->validate([
            'question' => 'required|string|max:500',
            'description' => 'nullable|string|max:2000',
            'poll_type' => 'required|in:single,multiple',
            'is_anonymous' => 'boolean',
            'show_results_before_vote' => 'boolean',
            'options' => 'required|array|min:2|max:10',
            'options.*' => 'required|string|max:200',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $poll = $this->pollService->createPoll($group->id, $user->id, $request->all());
        if (!$poll) return response()->json(['error' => 'Failed.'], 500);

        return response()->json($this->formatPoll($poll, $user->id));
    }

    public function votePoll(Request $request, string $groupUuid, int $pollId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $request->validate([
            'option_ids' => 'required|array|min:1',
            'option_ids.*' => 'integer|exists:org_group_poll_options,id',
        ]);

        $result = $this->pollService->vote($pollId, $user->id, $request->input('option_ids'));
        if ($result === false) return response()->json(['error' => 'Poll not found.'], 404);
        if ($result === 'poll_closed') return response()->json(['error' => 'Poll is closed.'], 422);

        $poll = $this->pollService->getPoll($pollId);
        return response()->json($this->formatPoll($poll, $user->id));
    }

    public function closePoll(string $groupUuid, int $pollId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $result = $this->pollService->closePoll($pollId, $user->id);
        if (!$result) return response()->json(['error' => 'Poll not found.'], 404);

        $poll = $this->pollService->getPoll($pollId);
        return response()->json($this->formatPoll($poll, $user->id));
    }

    public function destroyPoll(string $groupUuid, int $pollId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $result = $this->pollService->deletePoll($pollId, $group->id);
        if (!$result) return response()->json(['error' => 'Poll not found.'], 404);

        return response()->json(['success' => true]);
    }

    public function pollVoters(Request $request, string $groupUuid, int $pollId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyMembership($group->id, $user->id)) {
            return response()->json(['error' => 'Not a member.'], 403);
        }

        $poll = $this->pollService->getPoll($pollId);
        if (!$poll) return response()->json(['error' => 'Poll not found.'], 404);
        if ($poll->is_anonymous) return response()->json(['error' => 'Anonymous poll.'], 403);

        $optionId = $request->query('option_id') ? (int) $request->query('option_id') : null;
        $voters = $this->pollService->getVoters($pollId, $optionId);

        return response()->json($voters->map(fn($v) => [
            'id' => $v->user->id,
            'first_name' => $v->user->first_name,
            'last_name' => $v->user->last_name,
            'username' => $v->user->username,
            'profile_image' => $v->user->profile_image,
            'option_id' => $v->org_group_poll_option_id,
        ]));
    }

    // ─── Leader Management (president & vice_president only) ───

    private function verifyLeader(int $groupId, int $userId): ?OrgGroupMember
    {
        $member = $this->groupRepo->getMember($groupId, $userId);
        if (!$member || !in_array($member->role, ['president', 'vice_president'])) {
            return null;
        }
        return $member;
    }

    /**
     * Get group settings/info for the leader management panel.
     */
    public function getGroupSettings(string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);

        $member = $this->groupRepo->getMember($group->id, $user->id);
        $isLeader = $member && in_array($member->role, ['president', 'vice_president']);

        return response()->json([
            'group' => [
                'id' => $group->id,
                'uuid' => $group->uuid,
                'name' => $group->name,
                'description' => $group->description,
                'type' => $group->type,
                'member_count' => $group->activeMembers()->count(),
                'allow_join_requests' => $group->allow_join_requests,
                'max_members' => $group->max_members,
                'is_alumni' => $group->parent_group_id !== null,
            ],
            'is_leader' => $isLeader,
            'my_role' => $member?->role,
        ]);
    }

    /**
     * Search users to add as members (leader only).
     */
    public function searchUsersToAdd(Request $request, string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }

        $query = $request->query('q', '');
        if (strlen($query) < 2) return response()->json([]);

        $results = $this->groupRepo->searchEligibleUsers($group->organization_id, $query, $group->id);

        return response()->json($results->map(fn($u) => [
            'id' => $u->id,
            'uuid' => $u->uuid,
            'first_name' => $u->first_name,
            'last_name' => $u->last_name,
            'username' => $u->username,
            'profile_image' => $u->profile_image_url,
        ]));
    }

    /**
     * Add a member to the group (leader only, as regular member).
     */
    public function addMember(Request $request, string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }
        if ($group->parent_group_id) {
            return response()->json(['error' => 'Cannot add members to alumni groups.'], 403);
        }

        $request->validate([
            'user_id' => 'required|integer',
            'role' => 'nullable|string|in:president,vice_president,secretary,treasurer,pro,social_director,member',
        ]);
        $targetUserId = $request->input('user_id');
        $role = $request->input('role', 'member');

        // Check if already a member
        $existing = $this->groupRepo->getMember($group->id, $targetUserId);
        if ($existing && $existing->is_active) {
            return response()->json(['error' => 'User is already a member.'], 422);
        }

        // Check max members
        if ($group->max_members) {
            $count = $this->groupRepo->getMemberCount($group->id);
            if ($count >= $group->max_members) {
                return response()->json(['error' => 'Group is full.'], 422);
            }
        }

        // Check if banned
        if ($this->groupRepo->isBanned($group->id, $targetUserId)) {
            return response()->json(['error' => 'User is banned from this group.'], 422);
        }

        $result = $this->groupService->addMember($group->id, $targetUserId, $role, 'leader', $user->id);

        if ($result === 'role_taken') {
            return response()->json(['error' => 'That role is already assigned to another member.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Member added.']);
    }

    /**
     * Remove a member from the group (leader only).
     */
    public function removeMemberByLeader(string $groupUuid, int $userId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }

        if ($userId === $user->id) {
            return response()->json(['error' => 'You cannot remove yourself.'], 422);
        }

        // Cannot remove another president/vice_president
        $targetMember = $this->groupRepo->getMember($group->id, $userId);
        if ($targetMember && in_array($targetMember->role, ['president', 'vice_president'])) {
            return response()->json(['error' => 'Cannot remove another leader.'], 403);
        }

        $this->groupService->removeMember($group->id, $userId);

        return response()->json(['success' => true, 'message' => 'Member removed.']);
    }

    /**
     * Get join requests (leader only).
     */
    public function getJoinRequests(string $groupUuid)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }

        $requests = $this->groupRepo->getJoinRequests($group->id, 'pending');

        return response()->json($requests->map(fn($r) => [
            'id' => $r->id,
            'user' => [
                'id' => $r->user->id,
                'uuid' => $r->user->uuid,
                'first_name' => $r->user->first_name,
                'last_name' => $r->user->last_name,
                'username' => $r->user->username,
                'profile_image' => $r->user->profile_image_url,
            ],
            'message' => $r->message,
            'created_at' => $r->created_at->toISOString(),
        ]));
    }

    /**
     * Approve a join request (leader only).
     */
    public function approveJoinRequest(string $groupUuid, int $requestId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }

        $joinRequest = $this->groupRepo->findJoinRequest($requestId);
        if (!$joinRequest || $joinRequest->org_group_id !== $group->id) {
            return response()->json(['error' => 'Request not found.'], 404);
        }

        // Use updateJoinRequest + addMember directly (reviewed_by is org_accounts FK, so null for user-approved)
        if ($joinRequest->status !== 'pending') {
            return response()->json(['error' => 'Request already processed.'], 422);
        }

        if ($this->groupRepo->isBanned($group->id, $joinRequest->user_id)) {
            $this->groupRepo->updateJoinRequest($requestId, [
                'status' => 'rejected',
                'reviewed_at' => now(),
                'review_note' => "Rejected (user is banned). Reviewed by {$user->first_name} {$user->last_name}.",
            ]);
            return response()->json(['error' => 'User is banned from this group.'], 422);
        }

        if ($group->max_members) {
            $count = $this->groupRepo->getMemberCount($group->id);
            if ($count >= $group->max_members) {
                return response()->json(['error' => 'Group is full.'], 422);
            }
        }

        $this->groupRepo->addMember($group->id, $joinRequest->user_id, 'member', 'leader', $user->id);
        $this->groupRepo->updateJoinRequest($requestId, [
            'status' => 'approved',
            'reviewed_at' => now(),
            'review_note' => "Approved by {$user->first_name} {$user->last_name} (group leader).",
        ]);

        return response()->json(['success' => true, 'message' => 'Request approved.']);
    }

    /**
     * Reject a join request (leader only).
     */
    public function rejectJoinRequest(string $groupUuid, int $requestId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can manage members.'], 403);
        }

        $joinRequest = $this->groupRepo->findJoinRequest($requestId);
        if (!$joinRequest || $joinRequest->org_group_id !== $group->id || $joinRequest->status !== 'pending') {
            return response()->json(['error' => 'Request not found.'], 404);
        }

        $this->groupRepo->updateJoinRequest($requestId, [
            'status' => 'rejected',
            'reviewed_at' => now(),
            'review_note' => "Rejected by {$user->first_name} {$user->last_name} (group leader).",
        ]);

        return response()->json(['success' => true, 'message' => 'Request rejected.']);
    }

    /**
     * Change a member's role (leader only).
     */
    public function updateMemberRole(Request $request, string $groupUuid, int $userId)
    {
        $user = auth()->user();
        $group = $this->getGroupByUuid($groupUuid);
        if (!$group) return response()->json(['error' => 'Group not found.'], 404);
        if (!$this->verifyLeader($group->id, $user->id)) {
            return response()->json(['error' => 'Only president or vice president can change roles.'], 403);
        }

        $request->validate([
            'role' => 'required|string|in:president,vice_president,secretary,treasurer,pro,social_director,member',
        ]);

        if ($userId === $user->id) {
            return response()->json(['error' => 'You cannot change your own role.'], 422);
        }

        $targetMember = $this->groupRepo->getMember($group->id, $userId);
        if (!$targetMember || !$targetMember->is_active) {
            return response()->json(['error' => 'Member not found.'], 404);
        }

        // Cannot change another president/vice_president's role (unless you're the president)
        $myMember = $this->groupRepo->getMember($group->id, $user->id);
        if (in_array($targetMember->role, ['president', 'vice_president']) && $myMember->role !== 'president') {
            return response()->json(['error' => 'Only the president can change another leader\'s role.'], 403);
        }

        $result = $this->groupService->updateMemberRole($group->id, $userId, $request->input('role'));

        if ($result === 'role_taken') {
            return response()->json(['error' => 'That role is already assigned to another member.'], 422);
        }

        if ($result === false) {
            return response()->json(['error' => 'Failed to update role.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Role updated.']);
    }

    // ─── Helpers ────────────────────────────────────────────────

    private function formatMessage($message, int $currentUserId): array
    {
        return [
            'id' => $message->id,
            'user_id' => $message->user_id,
            'message' => $message->message,
            'message_type' => $message->message_type ?? 'text',
            'attachment_url' => $message->attachment_url,
            'attachment_name' => $message->attachment_name,
            'reply_to_id' => $message->reply_to_id,
            'replied_message' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'message' => $message->replyTo->message,
                'sender' => $message->replyTo->user ? [
                    'id' => $message->replyTo->user->id,
                    'first_name' => $message->replyTo->user->first_name,
                    'last_name' => $message->replyTo->user->last_name,
                ] : null,
            ] : null,
            'is_pinned' => $message->is_pinned ?? false,
            'created_at' => $message->created_at->toISOString(),
            'user' => $message->user ? [
                'id' => $message->user->id,
                'first_name' => $message->user->first_name,
                'last_name' => $message->user->last_name,
                'profile_image_url' => $message->user->profile_image_url,
            ] : null,
        ];
    }

    private function formatPoll($poll, int $userId): array
    {
        $userVotes = $this->pollService->getUserVotes($poll->id, $userId);
        $totalVoters = $this->pollService->getTotalVoters($poll->id);
        $totalVoteCount = $poll->votes_count;

        return [
            'id' => $poll->id,
            'question' => $poll->question,
            'description' => $poll->description,
            'poll_type' => $poll->poll_type,
            'is_anonymous' => $poll->is_anonymous,
            'show_results_before_vote' => $poll->show_results_before_vote,
            'is_active' => $poll->is_active,
            'is_closed' => $poll->isClosed(),
            'is_expired' => $poll->isExpired(),
            'expires_at' => $poll->expires_at?->toISOString(),
            'closed_at' => $poll->closed_at?->toISOString(),
            'created_at' => $poll->created_at->toISOString(),
            'creator' => $poll->creator ? [
                'id' => $poll->creator->id,
                'first_name' => $poll->creator->first_name,
                'last_name' => $poll->creator->last_name,
                'username' => $poll->creator->username,
                'profile_image' => $poll->creator->profile_image,
            ] : null,
            'options' => $poll->options->map(fn($opt) => [
                'id' => $opt->id,
                'label' => $opt->label,
                'votes_count' => $opt->votes_count,
                'percentage' => $totalVoteCount > 0
                    ? round(($opt->votes_count / $totalVoteCount) * 100, 1)
                    : 0,
            ]),
            'total_votes' => $totalVoteCount,
            'total_voters' => $totalVoters,
            'user_votes' => $userVotes->values(),
            'has_voted' => $userVotes->isNotEmpty(),
        ];
    }
}
