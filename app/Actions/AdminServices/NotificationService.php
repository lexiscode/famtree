<?php

namespace App\Actions\AdminServices;

use App\Models\GuestModels\Notification;
use App\Models\GuestModels\User;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class NotificationService
{
    /**
     * Send broadcast notification to all users or filtered set
     */
    public function sendBroadcast(array $data): array
    {
        try {
            $title = $data['title'] ?? 'System Notification';
            $message = $data['message'] ?? '';
            $type = $data['type'] ?? 'admin_broadcast';
            $filters = $data['filters'] ?? [];

            $query = User::query();

            // Apply filters if provided
            if (!empty($filters['account_status'])) {
                $query->where('account_status', $filters['account_status']);
            }

            if (!empty($filters['gender'])) {
                $query->where('gender', $filters['gender']);
            }

            if (isset($filters['two_fa_enabled'])) {
                $query->where('two_fa_enabled', (bool) $filters['two_fa_enabled']);
            }

            if (isset($filters['is_child_account'])) {
                $query->where('is_child_account', (bool) $filters['is_child_account']);
            }

            $users = $query->get();
            $sentCount = 0;

            // Batch insert notifications
            $notifications = [];
            $now = now();

            foreach ($users as $user) {
                $notifications[] = [
                    'user_id' => $user->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'is_read' => false,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $sentCount++;
            }

            // Insert in chunks to avoid memory issues
            $chunks = array_chunk($notifications, 500);
            foreach ($chunks as $chunk) {
                Notification::insert($chunk);
            }

            $this->logActivity('send_broadcast', 'Notification', 0, "Sent broadcast notification to {$sentCount} users: {$title}");

            return [
                'success' => true,
                'sent_count' => $sentCount,
                'message' => "Broadcast notification sent to {$sentCount} users",
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'sent_count' => 0,
                'message' => 'Failed to send broadcast notification',
            ];
        }
    }

    /**
     * Get notification history
     */
    public function getHistory(int $perPage = 20, int $page = 1): array
    {
        // Get admin broadcast notifications grouped by creation time
        $notifications = Notification::where('type', 'admin_broadcast')
            ->select(
                'title',
                'message',
                'type',
                DB::raw('MIN(created_at) as created_at'),
                DB::raw('COUNT(*) as recipients_count'),
                DB::raw('SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count')
            )
            ->groupBy('title', 'message', 'type')
            ->orderByDesc(DB::raw('MIN(created_at)'))
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'notifications' => $notifications->through(function ($notification) {
                return [
                    'title' => $notification->title,
                    'message' => $notification->message,
                    'type' => $notification->type,
                    'recipients_count' => $notification->recipients_count,
                    'read_count' => $notification->read_count,
                    'created_at' => $notification->created_at,
                    'created_at_formatted' => \Carbon\Carbon::parse($notification->created_at)->diffForHumans(),
                ];
            }),
        ];
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
        }
    }
}
