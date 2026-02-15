<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\GlamSquad;
use App\Models\GuestModels\GlamSquadMember;
use App\Models\GuestModels\GlamSquadMessage;

class GlamSquadMessageRepository
{
    public function getMessages(int $squadId, ?int $beforeId = null, int $limit = 50)
    {
        $query = GlamSquadMessage::where('squad_id', $squadId)
            ->with([
                'sender',
                'repliedMessage:id,sender_id,message',
                'repliedMessage.sender:id,first_name,last_name',
            ])
            ->orderByDesc('id');

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        return $query->limit($limit)->get()->reverse()->values();
    }

    public function createMessage(array $data): GlamSquadMessage
    {
        return GlamSquadMessage::create($data);
    }

    public function findMessage(int $id): ?GlamSquadMessage
    {
        return GlamSquadMessage::find($id);
    }

    public function updateMessage(int $id, string $message): ?GlamSquadMessage
    {
        $msg = GlamSquadMessage::find($id);
        if ($msg) {
            $msg->update([
                'message' => $message,
                'is_edited' => true,
                'edited_at' => now(),
            ]);
            return $msg->fresh();
        }
        return null;
    }

    public function delete(int $id): bool
    {
        return GlamSquadMessage::where('id', $id)->delete() > 0;
    }

    public function bulkDeleteMessages(array $messageIds, int $senderId): int
    {
        return GlamSquadMessage::whereIn('id', $messageIds)
            ->where('sender_id', $senderId)
            ->delete();
    }

    public function markAsRead(int $squadId, int $userId): void
    {
        GlamSquadMember::where('squad_id', $squadId)
            ->where('user_id', $userId)
            ->update(['last_read_at' => now()]);
    }

    public function getLatestMessage(int $squadId): ?GlamSquadMessage
    {
        return GlamSquadMessage::where('squad_id', $squadId)
            ->with('sender')
            ->orderByDesc('id')
            ->first();
    }

    public function getUnreadCount(int $squadId, int $userId): int
    {
        $member = GlamSquadMember::where('squad_id', $squadId)
            ->where('user_id', $userId)
            ->first();

        if (!$member || !$member->last_read_at) {
            return GlamSquadMessage::where('squad_id', $squadId)
                ->where('sender_id', '!=', $userId)
                ->count();
        }

        return GlamSquadMessage::where('squad_id', $squadId)
            ->where('sender_id', '!=', $userId)
            ->where('created_at', '>', $member->last_read_at)
            ->count();
    }
}
