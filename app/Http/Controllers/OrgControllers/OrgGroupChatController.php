<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgGroupMessageService;
use App\Actions\OrgServices\OrgGroupService;
use App\Repositories\OrgRepositories\OrgActivityLogRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrgGroupChatController extends Controller
{
    public function __construct(
        private OrgGroupMessageService $messageService,
        private OrgGroupService $groupService,
        private OrgActivityLogRepository $activityLogRepo,
    ) {}

    private function getAccessScope(): bool|int
    {
        $orgAccount = Auth::guard('org')->user();

        if (Gate::allows('manage-org-groups')) {
            return true;
        }

        if ($orgAccount->linked_org_group_id) {
            return $orgAccount->linked_org_group_id;
        }

        abort(403);
    }

    private function canAccessGroup(int $groupId): bool
    {
        $scope = $this->getAccessScope();
        return $scope === true || $scope === $groupId;
    }

    /**
     * Show the chat page for a group.
     */
    public function show(int $groupId)
    {
        if (!$this->canAccessGroup($groupId)) {
            abort(403);
        }

        $group = $this->groupService->getGroup($groupId);
        if (!$group) abort(404);

        $orgAccount = Auth::guard('org')->user();
        if ($group->organization_id !== $orgAccount->organization_id) {
            abort(403);
        }

        $messages = $this->messageService->getMessages($groupId, 50);
        $pinnedMessages = $this->messageService->getPinnedMessages($groupId);

        return Inertia::render('OrgPages/OrgGroups/Chat', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'type' => $group->type,
                'active_members_count' => $group->activeMembers->count(),
                'members' => $group->activeMembers->map(fn($m) => [
                    'id' => $m->id,
                    'user_id' => $m->user_id,
                    'first_name' => $m->user->first_name,
                    'last_name' => $m->user->last_name,
                    'username' => $m->user->username,
                    'profile_image' => $m->user->profile_image,
                    'role' => $m->role,
                    'is_leader' => $m->isLeader(),
                ]),
            ],
            'initialMessages' => $messages->map(fn($m) => $this->formatMessage($m)),
            'pinnedMessages' => $pinnedMessages->map(fn($m) => $this->formatMessage($m)),
            'isLimitedAccess' => $this->getAccessScope() !== true,
            'isSuspended' => $group->is_suspended,
            'suspensionReason' => $group->suspension_reason,
        ]);
    }

    /**
     * Fetch messages (for polling / load more).
     */
    public function messages(Request $request, int $groupId)
    {
        if (!$this->canAccessGroup($groupId)) {
            abort(403);
        }

        $beforeId = $request->query('before_id');
        $afterId = $request->query('after_id');

        if ($afterId) {
            $messages = $this->messageService->getNewMessages($groupId, (int) $afterId);
        } else {
            $messages = $this->messageService->getMessages($groupId, 50, $beforeId ? (int) $beforeId : null);
        }

        return response()->json($messages->map(fn($m) => $this->formatMessage($m)));
    }

    /**
     * Send a message.
     */
    public function send(Request $request, int $groupId)
    {
        if (!$this->canAccessGroup($groupId)) {
            abort(403);
        }

        // Check suspension
        $group = $this->groupService->getGroup($groupId);
        if ($group && $group->is_suspended) {
            return response()->json(['error' => 'This group is suspended.'], 403);
        }

        $request->validate([
            'message' => 'required_without:attachment|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:org_group_messages,id',
            'attachment' => 'nullable|file|max:10240', // 10MB max
        ]);

        $orgAccount = Auth::guard('org')->user();
        $data = [
            'message' => $request->input('message'),
            'reply_to_id' => $request->input('reply_to_id'),
        ];

        // Handle file attachment
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('org-group-attachments', 'public');
            $data['attachment_url'] = '/storage/' . $path;
            $data['attachment_name'] = $file->getClientOriginalName();

            $ext = strtolower($file->getClientOriginalExtension());
            $imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $data['message_type'] = in_array($ext, $imageExts) ? 'image' : 'file';
        }

        // The org staff member needs a user_id to send messages
        // They send on behalf of their linked user or as org staff
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $result = $this->messageService->sendMessage($groupId, $userId, $data);

        if ($result === null) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        if ($result === 'not_member') {
            // Org staff can still send - create message directly
            $data['org_group_id'] = $groupId;
            $data['user_id'] = $userId;
            $data['message_type'] = $data['message_type'] ?? 'text';

            $message = \App\Models\OrgModels\OrgGroupMessage::create($data);
            return response()->json($this->formatMessage($message->load([
                'user:id,uuid,first_name,last_name,username,profile_image',
                'replyTo' => function ($q) {
                    $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
                },
            ])));
        }

        return response()->json($this->formatMessage($result->load([
            'user:id,uuid,first_name,last_name,username,profile_image',
            'replyTo' => function ($q) {
                $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
            },
        ])));
    }

    /**
     * Delete a message.
     */
    public function destroy(int $groupId, int $messageId)
    {
        if (!$this->canAccessGroup($groupId)) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;
        $isOrgStaff = $this->getAccessScope() === true;

        $result = $this->messageService->deleteMessage($messageId, $userId, $isOrgStaff);

        if ($result === false) {
            return response()->json(['error' => 'Message not found.'], 404);
        }
        if ($result === 'unauthorized') {
            return response()->json(['error' => 'Not authorized.'], 403);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Toggle pin on a message.
     */
    public function togglePin(int $groupId, int $messageId)
    {
        if (!$this->canAccessGroup($groupId)) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $result = $this->messageService->togglePin($messageId, $userId);

        if ($result === false) {
            return response()->json(['error' => 'Message not found.'], 404);
        }

        return response()->json($result);
    }

    private function formatMessage($message): array
    {
        return [
            'id' => $message->id,
            'user' => $message->user ? [
                'id' => $message->user->id,
                'uuid' => $message->user->uuid,
                'first_name' => $message->user->first_name,
                'last_name' => $message->user->last_name,
                'username' => $message->user->username,
                'profile_image' => $message->user->profile_image,
            ] : null,
            'message' => $message->message,
            'message_type' => $message->message_type,
            'attachment_url' => $message->attachment_url,
            'attachment_name' => $message->attachment_name,
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'message' => $message->replyTo->message,
                'user' => $message->replyTo->user ? [
                    'first_name' => $message->replyTo->user->first_name,
                    'last_name' => $message->replyTo->user->last_name,
                ] : null,
                'is_deleted' => $message->replyTo->trashed(),
            ] : null,
            'is_pinned' => $message->is_pinned,
            'created_at' => $message->created_at->toISOString(),
            'is_deleted' => $message->trashed(),
        ];
    }
}
