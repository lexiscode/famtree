<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\NotificationRepository;

class NotificationService
{
    public function __construct(
        private NotificationRepository $notificationRepository,
    ) {}

    /**
     * Create a generic notification
     */
    public function createNotification(
        int $userId,
        string $type,
        string $title,
        string $message,
        ?int $relatedUserId = null,
        ?int $relatedObjectId = null,
        ?string $relatedObjectType = null,
        ?string $actionUrl = null
    ) {
        return $this->notificationRepository->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'related_user_id' => $relatedUserId,
            'related_object_id' => $relatedObjectId,
            'related_object_type' => $relatedObjectType,
            'action_url' => $actionUrl,
            'is_read' => false,
        ]);
    }

    /**
     * Notify when receiving a connection request
     */
    public function notifyConnectionRequest(int $requesterId, int $recipientId, string $relationshipType): void
    {
        $requester = User::find($requesterId);

        if (!$requester || !User::find($recipientId)) {
            return;
        }

        $this->createNotification(
            $recipientId,
            'connection_request',
            'New Connection Request',
            "{$requester->first_name} {$requester->last_name} sent you a connection request as {$relationshipType}.",
            $requesterId,
            $requesterId,
            'user_connection',
            route('connections.pending')
        );
    }

    /**
     * Notify when connection request is accepted
     */
    public function notifyConnectionAccepted(int $recipientId, int $accepterId, string $relationshipType): void
    {
        $accepter = User::find($accepterId);

        if (!$accepter || !User::find($recipientId)) {
            return;
        }

        $this->createNotification(
            $recipientId,
            'connection_accepted',
            'Connection Accepted',
            "{$accepter->first_name} {$accepter->last_name} accepted your connection request as {$relationshipType}.",
            $accepterId,
            $accepterId,
            'user_connection',
            route('connections.index')
        );
    }

    /**
     * Notify when connection request is declined
     */
    public function notifyConnectionDeclined(int $recipientId, int $declinerId): void
    {
        $decliner = User::find($declinerId);

        if (!$decliner || !User::find($recipientId)) {
            return;
        }

        $this->createNotification(
            $recipientId,
            'connection_declined',
            'Connection Declined',
            "{$decliner->first_name} {$decliner->last_name} declined your connection request.",
            $declinerId,
            $declinerId,
            'user_connection',
            route('connections.sent')
        );
    }

    /**
     * Notify when connection is undone
     */
    public function notifyConnectionUndone(int $recipientId, int $undoerId): void
    {
        $undoer = User::find($undoerId);

        if (!$undoer || !User::find($recipientId)) {
            return;
        }

        $this->createNotification(
            $recipientId,
            'connection_undone',
            'Connection Undone',
            "{$undoer->first_name} {$undoer->last_name} undone your connection.",
            $undoerId,
            $undoerId,
            'user_connection',
            route('connections.index')
        );
    }

    /**
     * Notify when user is added to a family tree
     */
    public function notifyFamilyTreeMemberAdded(int $userId, int $addedByUserId, int $treeId, string $treeName): void
    {
        $addedBy = User::find($addedByUserId);

        if (!$addedBy || !User::find($userId)) {
            return;
        }

        $this->createNotification(
            $userId,
            'family_tree_member_added',
            'Added to Family Tree',
            "{$addedBy->first_name} {$addedBy->last_name} added you to the family tree \"{$treeName}\".",
            $addedByUserId,
            $treeId,
            'family_tree',
            route('family-tree.show', ['treeId' => $treeId])
        );
    }

    /**
     * Notify when user status changes (e.g., marked as deceased)
     */
    public function notifyStatusChanged(int $userId, int $changedByUserId, string $newStatus): void
    {
        $changedBy = User::find($changedByUserId);
        $user = User::find($userId);

        if (!$changedBy || !$user) {
            return;
        }

        $message = $newStatus === 'deceased'
            ? "{$changedBy->first_name} {$changedBy->last_name} marked {$user->first_name} as deceased."
            : "{$changedBy->first_name} {$changedBy->last_name} updated {$user->first_name}'s status.";

        $this->createNotification(
            $changedByUserId,
            'status_changed',
            'Status Updated',
            $message,
            $userId,
            $userId,
            'user',
            route('profile.view', ['userId' => $userId])
        );
    }

    /**
     * Notify when child account reaches age of majority
     */
    public function notifyChildAccountComeOfAge(int $parentId, int $childId, string $childName): void
    {
        if (!User::find($parentId) || !User::find($childId)) {
            return;
        }

        $this->createNotification(
            $parentId,
            'child_account_created',
            'Child Account Milestone',
            "{$childName} has reached the age of 18 and can now set their own email and password.",
            $childId,
            $childId,
            'user',
            route('child-accounts.show', ['childId' => $childId])
        );
    }

    /**
     * Get unread notifications for user
     */
    public function getUnreadNotifications(int $userId, int $limit = 20)
    {
        return $this->notificationRepository->getUnread($userId, $limit);
    }

    /**
     * Get unread notification count
     */
    public function getUnreadCount(int $userId): int
    {
        return $this->notificationRepository->getUnreadCount($userId);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(int $notificationId): void
    {
        $this->notificationRepository->markAsRead($notificationId);
    }

    /**
     * Mark all notifications as read for user
     */
    public function markAllAsRead(int $userId): void
    {
        $this->notificationRepository->markAllAsRead($userId);
    }

    /**
     * Delete a notification
     */
    public function deleteNotification(int $notificationId): void
    {
        $this->notificationRepository->delete($notificationId);
    }

    /**
     * Get notifications with related user data
     */
    public function getNotificationsWithRelations(int $userId, int $limit = 20)
    {
        return $this->notificationRepository->getWithRelations($userId, $limit);
    }

    /**
     * Get unread count and recent notifications
     */
    public function getUnreadWithCount(int $userId, int $limit = 20): array
    {
        return $this->notificationRepository->getUnreadWithCount($userId, $limit);
    }

    /**
     * Check if user has unread notifications
     */
    public function hasUnread(int $userId): bool
    {
        return $this->notificationRepository->hasUnread($userId);
    }

    /**
     * Notify when someone follows you
     */
    public function sendFollowNotification(int $followerId, int $followedUserId): void
    {
        $follower = User::find($followerId);

        if (!$follower || !User::find($followedUserId)) {
            return;
        }

        $this->createNotification(
            $followedUserId,
            'user_followed',
            'New Follower',
            "{$follower->first_name} {$follower->last_name} started following you.",
            $followerId,
            $followerId,
            'user_follow',
            route('profile.view', ['userId' => $followerId])
        );
    }
}
