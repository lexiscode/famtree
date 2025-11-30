<?php

namespace App\Actions\AdminServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\FamilyTree;
use App\Models\UserReport;
use App\Models\AdminActivityLog;

class DashboardService
{
    /**
     * Get key metrics for dashboard
     */
    public function getKeyMetrics()
    {
        return [
            'totalUsers' => User::count(),
            'activeUsers' => User::where('updated_at', '>=', now()->subDay())->count(),
            'totalConnections' => UserConnection::where('status', 'accepted')->count(),
            'totalFamilyTrees' => FamilyTree::count(),
            'pendingReports' => UserReport::where('status', 'pending')->count(),
        ];
    }

    /**
     * Get user growth data for specified days
     */
    public function getUserGrowthData($days = 30)
    {
        $data = [];

        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->startOfDay();
            $count = User::whereBetween('created_at', [
                $date,
                $date->copy()->endOfDay()
            ])->count();

            $data[] = [
                'date' => $date->format('M d'),
                'count' => $count,
            ];
        }

        return $data;
    }

    /**
     * Get connection statistics
     */
    public function getConnectionStats()
    {
        return [
            'total' => UserConnection::count(),
            'accepted' => UserConnection::where('status', 'accepted')->count(),
            'pending' => UserConnection::where('status', 'pending')->count(),
            'declined' => UserConnection::where('status', 'declined')->count(),
        ];
    }

    /**
     * Get report statistics
     */
    public function getReportStats()
    {
        return [
            'total' => UserReport::count(),
            'pending' => UserReport::where('status', 'pending')->count(),
            'reviewing' => UserReport::where('status', 'reviewing')->count(),
            'resolved' => UserReport::where('status', 'resolved')->count(),
            'dismissed' => UserReport::where('status', 'dismissed')->count(),
        ];
    }

    /**
     * Get recent admin activity
     */
    public function getRecentActivity($limit = 10)
    {
        return AdminActivityLog::with('admin')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'admin' => $log->admin?->username ?? 'System',
                    'action' => $log->action_type,
                    'description' => $log->description,
                    'timestamp' => $log->created_at->diffForHumans(),
                ];
            });
    }

    /**
     * Get active alerts
     */
    public function getActiveAlerts()
    {
        $alerts = [];

        // Check for high number of pending reports
        $pendingReports = UserReport::where('status', 'pending')->count();
        if ($pendingReports > 10) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "There are $pendingReports pending reports that need review.",
                'priority' => 'high',
            ];
        }

        // Check for suspicious activity
        $failedLogins = AdminActivityLog::where('action_type', 'failed_login')
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($failedLogins > 5) {
            $alerts[] = [
                'type' => 'alert',
                'message' => "There have been $failedLogins failed admin login attempts in the last hour.",
                'priority' => 'critical',
            ];
        }

        return $alerts;
    }
}
