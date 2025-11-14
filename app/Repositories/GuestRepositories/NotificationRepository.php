<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\Notification;
use Illuminate\Support\Collection;

class NotificationRepository
{
    /**
     * Create a new notification
     */
    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    /**
     * Get a notification by ID
     */
    public function find(int $id): ?Notification
    {
        return Notification::find($id);
    }

    /**
     * Get unread notifications for a user
     */
    public function getUnread(int $userId, int $limit = 20): Collection
    {
        return Notification::forUser($userId)
            ->unread()
            ->recent($limit)
            ->get();
    }

    /**
     * Get all notifications for a user
     */
    public function get(int $userId, int $limit = 50): Collection
    {
        return Notification::forUser($userId)
            ->recent($limit)
            ->get();
    }

    /**
     * Get unread notification count for a user
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::forUser($userId)
            ->unread()
            ->count();
    }

    /**
     * Mark a notification as read
     */
    public function markAsRead(int $notificationId): Notification
    {
        $notification = $this->find($notificationId);

        if ($notification) {
            $notification->markAsRead();
        }

        return $notification;
    }

    /**
     * Mark all notifications as read for a user
     */
    public function markAllAsRead(int $userId): int
    {
        return Notification::forUser($userId)
            ->unread()
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
    }

    /**
     * Mark a notification as unread
     */
    public function markAsUnread(int $notificationId): Notification
    {
        $notification = $this->find($notificationId);

        if ($notification) {
            $notification->markAsUnread();
        }

        return $notification;
    }

    /**
     * Delete a notification
     */
    public function delete(int $notificationId): bool
    {
        $notification = $this->find($notificationId);

        if ($notification) {
            return $notification->delete();
        }

        return false;
    }

    /**
     * Delete all notifications for a user
     */
    public function deleteAll(int $userId): int
    {
        return Notification::forUser($userId)->delete();
    }

    /**
     * Get notifications by type
     */
    public function getByType(int $userId, string $type, int $limit = 20): Collection
    {
        return Notification::forUser($userId)
            ->where('type', $type)
            ->recent($limit)
            ->get();
    }

    /**
     * Check if user has unread notifications
     */
    public function hasUnread(int $userId): bool
    {
        return Notification::forUser($userId)
            ->unread()
            ->exists();
    }

    /**
     * Get notifications for a user paginated
     */
    public function getPaginated(int $userId, int $perPage = 15)
    {
        return Notification::forUser($userId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get unread notifications paginated
     */
    public function getUnreadPaginated(int $userId, int $perPage = 15)
    {
        return Notification::forUser($userId)
            ->unread()
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Clean old read notifications (older than 30 days)
     */
    public function cleanOldNotifications(int $daysOld = 30): int
    {
        $date = now()->subDays($daysOld);

        return Notification::where('is_read', true)
            ->where('read_at', '<', $date)
            ->delete();
    }

    /**
     * Get notifications for a user with related data
     */
    public function getWithRelations(int $userId, int $limit = 20): Collection
    {
        return Notification::forUser($userId)
            ->with(['relatedUser:id,first_name,last_name,username,profile_image_url'])
            ->recent($limit)
            ->get();
    }

    /**
     * Get unread count and recent notifications together
     */
    public function getUnreadWithCount(int $userId, int $limit = 20): array
    {
        return [
            'count' => $this->getUnreadCount($userId),
            'notifications' => $this->getUnread($userId, $limit),
        ];
    }
}
