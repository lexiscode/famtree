<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\ClassSetMessage;
use App\Models\GuestModels\ClassSetMember;

class ClassSetMessageRepository
{
    /**
     * Get messages for a class set with pagination
     */
    public function getMessages(int $classSetId, int $limit = 50, ?int $beforeId = null)
    {
        $query = ClassSetMessage::where('class_set_id', $classSetId)
            ->with([
                'sender:id,uuid,first_name,last_name,username,profile_image',
                'organization',
                'orgAccount',
            ]);

        if ($beforeId) {
            $query->where('id', '<', $beforeId);
        }

        return $query->orderByDesc('created_at')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values();
    }

    /**
     * Create a new message
     */
    public function createMessage(int $classSetId, int $senderId, string $message): ClassSetMessage
    {
        return ClassSetMessage::create([
            'class_set_id' => $classSetId,
            'sender_id' => $senderId,
            'message' => $message,
        ]);
    }

    /**
     * Create a broadcast message in a class set
     */
    public function createBroadcastMessage(
        int $classSetId,
        string $message,
        int $orgBroadcastId,
        int $orgAccountId,
        int $organizationId
    ): ClassSetMessage {
        return ClassSetMessage::create([
            'class_set_id' => $classSetId,
            'sender_id' => null,
            'message' => $message,
            'is_org_broadcast' => true,
            'org_broadcast_id' => $orgBroadcastId,
            'org_account_id' => $orgAccountId,
            'organization_id' => $organizationId,
        ]);
    }

    /**
     * Get the latest message for a class set
     */
    public function getLatestMessage(int $classSetId): ?ClassSetMessage
    {
        return ClassSetMessage::where('class_set_id', $classSetId)
            ->with(['sender:id,uuid,first_name,last_name,username', 'organization:id,name,short_name'])
            ->latest()
            ->first();
    }

    /**
     * Find message by UUID
     */
    public function findByUuid(string $uuid): ?ClassSetMessage
    {
        return ClassSetMessage::where('uuid', $uuid)
            ->with(['sender:id,uuid,first_name,last_name,username,profile_image'])
            ->first();
    }

    /**
     * Find a message by ID
     */
    public function findMessage(int $messageId): ?ClassSetMessage
    {
        return ClassSetMessage::find($messageId);
    }

    /**
     * Update a message's content
     */
    public function updateMessage(int $messageId, string $newMessage): ?ClassSetMessage
    {
        $message = ClassSetMessage::find($messageId);

        if ($message) {
            $message->update([
                'message' => $newMessage,
                'is_edited' => true,
                'edited_at' => now(),
            ]);
        }

        return $message;
    }

    /**
     * Delete a message
     */
    public function delete(int $messageId): bool
    {
        return ClassSetMessage::destroy($messageId) > 0;
    }

    /**
     * Bulk delete messages
     */
    public function bulkDeleteMessages(array $messageIds): int
    {
        return ClassSetMessage::whereIn('id', $messageIds)->delete();
    }

    /**
     * Get message count for a class set
     */
    public function getMessageCount(int $classSetId): int
    {
        return ClassSetMessage::where('class_set_id', $classSetId)->count();
    }

    /**
     * Get messages since a specific timestamp
     */
    public function getMessagesSince(int $classSetId, string $since)
    {
        return ClassSetMessage::where('class_set_id', $classSetId)
            ->where('created_at', '>', $since)
            ->with(['sender:id,uuid,first_name,last_name,username,profile_image'])
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Mark messages as read for a user by updating their last_read_at timestamp
     */
    public function markAsRead(int $classSetId, int $userId): void
    {
        ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->update(['last_read_at' => now()]);
    }

    /**
     * Get unread message count for a user in a class set
     * Counts messages from OTHER users created after the user's last_read_at
     */
    public function getUnreadCount(int $classSetId, int $userId): int
    {
        // Get the user's last read timestamp for this class set
        $lastRead = ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->value('last_read_at');

        $query = ClassSetMessage::where('class_set_id', $classSetId)
            ->where('sender_id', '!=', $userId); // Only count messages from OTHER users

        if ($lastRead) {
            $query->where('created_at', '>', $lastRead);
        }

        return $query->count();
    }

    /**
     * Get total unread message count for a user across all their class sets
     * Counts messages from OTHER users created after each class set's last_read_at
     */
    public function getTotalUnreadCount(int $userId, array $classSetIds): int
    {
        if (empty($classSetIds)) {
            return 0;
        }

        $totalUnread = 0;

        foreach ($classSetIds as $classSetId) {
            $totalUnread += $this->getUnreadCount($classSetId, $userId);
        }

        return $totalUnread;
    }
}
