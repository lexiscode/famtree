<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgGroupMessage;
use Illuminate\Support\Collection;

class OrgGroupMessageRepository
{
    public function getMessages(int $groupId, int $limit = 50, ?int $beforeId = null): Collection
    {
        $query = OrgGroupMessage::where('org_group_id', $groupId)
            ->with([
                'user:id,uuid,first_name,last_name,username,profile_image',
                'replyTo' => function ($q) {
                    $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
                },
            ])
            ->orderBy('id', 'desc')
            ->limit($limit);

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        return $query->get()->reverse()->values();
    }

    public function getNewMessages(int $groupId, int $afterId): Collection
    {
        return OrgGroupMessage::where('org_group_id', $groupId)
            ->where('id', '>', $afterId)
            ->with([
                'user:id,uuid,first_name,last_name,username,profile_image',
                'replyTo' => function ($q) {
                    $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
                },
            ])
            ->orderBy('id', 'asc')
            ->get();
    }

    public function getPinnedMessages(int $groupId): Collection
    {
        return OrgGroupMessage::where('org_group_id', $groupId)
            ->where('is_pinned', true)
            ->with('user:id,uuid,first_name,last_name,username,profile_image')
            ->orderBy('pinned_at', 'desc')
            ->get();
    }

    public function create(array $data): OrgGroupMessage
    {
        return OrgGroupMessage::create($data);
    }

    public function findById(int $id): ?OrgGroupMessage
    {
        return OrgGroupMessage::with([
            'user:id,uuid,first_name,last_name,username,profile_image',
            'replyTo' => function ($q) {
                $q->withTrashed()->with('user:id,uuid,first_name,last_name,username,profile_image');
            },
        ])->find($id);
    }

    public function delete(int $id): bool
    {
        $message = OrgGroupMessage::find($id);
        if (!$message) return false;
        return $message->delete();
    }

    public function pin(int $id, int $pinnedBy): ?OrgGroupMessage
    {
        $message = OrgGroupMessage::find($id);
        if (!$message) return null;
        $message->update([
            'is_pinned' => true,
            'pinned_by' => $pinnedBy,
            'pinned_at' => now(),
        ]);
        return $message->fresh();
    }

    public function unpin(int $id): ?OrgGroupMessage
    {
        $message = OrgGroupMessage::find($id);
        if (!$message) return null;
        $message->update([
            'is_pinned' => false,
            'pinned_by' => null,
            'pinned_at' => null,
        ]);
        return $message->fresh();
    }

    public function getMessageCount(int $groupId): int
    {
        return OrgGroupMessage::where('org_group_id', $groupId)->count();
    }

    public function getLatestMessage(int $groupId): ?OrgGroupMessage
    {
        return OrgGroupMessage::where('org_group_id', $groupId)
            ->with('user:id,uuid,first_name,last_name,username,profile_image')
            ->orderBy('id', 'desc')
            ->first();
    }
}
