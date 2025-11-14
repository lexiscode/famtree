<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\NotificationService;
use App\Repositories\GuestRepositories\NotificationRepository;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService,
        private NotificationRepository $notificationRepository,
    ) {}

    /**
     * Get unread notifications for current user
     */
    public function getUnread(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $limit = $request->input('limit', 20);

        try {
            $notifications = $this->notificationService->getNotificationsWithRelations($user->id, $limit);

            return response()->json([
                'notifications' => $notifications->map(fn($n) => $this->formatNotification($n)),
                'count' => $this->notificationService->getUnreadCount($user->id),
                'has_unread' => $this->notificationService->hasUnread($user->id),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get all notifications for current user
     */
    public function getAll(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $limit = $request->input('limit', 50);

        try {
            $notifications = $this->notificationRepository->get($user->id, $limit);

            return response()->json([
                'notifications' => $notifications->map(fn($n) => $this->formatNotification($n)),
                'count' => $notifications->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get unread notification count
     */
    public function getCount(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'unread_count' => $this->notificationService->getUnreadCount($user->id),
            'has_unread' => $this->notificationService->hasUnread($user->id),
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead(Request $request, int $notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $notification = $this->notificationRepository->find($notificationId);

            if (!$notification || $notification->user_id !== $user->id) {
                return response()->json(['error' => 'Not found'], 404);
            }

            $this->notificationService->markAsRead($notificationId);

            return response()->json([
                'success' => true,
                'message' => 'Notification marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $this->notificationService->markAllAsRead($user->id);

            return response()->json([
                'success' => true,
                'message' => 'All notifications marked as read',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete notification
     */
    public function delete(Request $request, int $notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $notification = $this->notificationRepository->find($notificationId);

            if (!$notification || $notification->user_id !== $user->id) {
                return response()->json(['error' => 'Not found'], 404);
            }

            $this->notificationService->deleteNotification($notificationId);

            return response()->json([
                'success' => true,
                'message' => 'Notification deleted',
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get notification by ID
     */
    public function show(Request $request, int $notificationId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $notification = $this->notificationRepository->find($notificationId);

            if (!$notification || $notification->user_id !== $user->id) {
                return response()->json(['error' => 'Not found'], 404);
            }

            // Mark as read when viewed
            if (!$notification->is_read) {
                $this->notificationService->markAsRead($notificationId);
            }

            return response()->json([
                'notification' => $this->formatNotification($notification),
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Format notification for response
     */
    private function formatNotification($notification): array
    {
        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'type_label' => $notification->getTypeLabel(),
            'type_icon' => $notification->getTypeIcon(),
            'type_color' => $notification->getTypeColor(),
            'title' => $notification->title,
            'message' => $notification->message,
            'is_read' => $notification->is_read,
            'action_url' => $notification->action_url,
            'related_user' => $notification->relatedUser ? [
                'id' => $notification->relatedUser->id,
                'name' => $notification->relatedUser->first_name . ' ' . $notification->relatedUser->last_name,
                'username' => $notification->relatedUser->username,
                'profile_image_url' => $notification->relatedUser->profile_image_url,
            ] : null,
            'created_at' => $notification->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $notification->created_at->diffForHumans(),
            'read_at' => $notification->read_at?->format('Y-m-d H:i:s'),
        ];
    }
}
