<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgGroupMessageRepository;
use App\Repositories\OrgRepositories\OrgGroupRepository;

class OrgGroupMessageService
{
    public function __construct(
        private OrgGroupMessageRepository $messageRepo,
        private OrgGroupRepository $groupRepo,
    ) {}

    public function getMessages(int $groupId, int $limit = 50, ?int $beforeId = null)
    {
        return $this->messageRepo->getMessages($groupId, $limit, $beforeId);
    }

    public function getNewMessages(int $groupId, int $afterId)
    {
        return $this->messageRepo->getNewMessages($groupId, $afterId);
    }

    public function getPinnedMessages(int $groupId)
    {
        return $this->messageRepo->getPinnedMessages($groupId);
    }

    public function sendMessage(int $groupId, int $userId, array $data)
    {
        $group = $this->groupRepo->findById($groupId);
        if (!$group) return null;

        // Verify user is a member
        $member = $this->groupRepo->getMember($groupId, $userId);
        if (!$member) return 'not_member';

        return $this->messageRepo->create([
            'org_group_id' => $groupId,
            'user_id' => $userId,
            'message' => $data['message'] ?? null,
            'message_type' => $data['message_type'] ?? 'text',
            'attachment_url' => $data['attachment_url'] ?? null,
            'attachment_name' => $data['attachment_name'] ?? null,
            'reply_to_id' => $data['reply_to_id'] ?? null,
        ]);
    }

    public function deleteMessage(int $messageId, int $userId, bool $isOrgStaff = false): bool|string
    {
        $message = $this->messageRepo->findById($messageId);
        if (!$message) return false;

        // Only the sender or org staff can delete
        if (!$isOrgStaff && $message->user_id !== $userId) {
            // Check if user is a leader in the group
            $member = $this->groupRepo->getMember($message->org_group_id, $userId);
            if (!$member || !$member->isLeader()) {
                return 'unauthorized';
            }
        }

        return $this->messageRepo->delete($messageId);
    }

    public function togglePin(int $messageId, int $userId): array|false
    {
        $message = $this->messageRepo->findById($messageId);
        if (!$message) return false;

        if ($message->is_pinned) {
            $this->messageRepo->unpin($messageId);
            return ['action' => 'unpinned'];
        } else {
            $this->messageRepo->pin($messageId, $userId);
            return ['action' => 'pinned'];
        }
    }
}
