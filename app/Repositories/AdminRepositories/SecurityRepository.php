<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminActivityLog;
use App\Models\GuestModels\User;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class SecurityRepository
{
    /**
     * Get admin activity logs with pagination and filters
     */
    public function getAdminActivityLogs(int $perPage = 20, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = AdminActivityLog::with('admin')->orderBy('created_at', 'desc');

        if (!empty($filters['admin_id'])) {
            $query->where('admin_id', $filters['admin_id']);
        }

        if (!empty($filters['action_type'])) {
            $query->where('action_type', $filters['action_type']);
        }

        if (!empty($filters['resource_type'])) {
            $query->where('resource_type', $filters['resource_type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhere('action_type', 'like', "%{$search}%")
                    ->orWhere('resource_type', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['dateFrom'])) {
            $query->whereDate('created_at', '>=', $filters['dateFrom']);
        }

        if (!empty($filters['dateTo'])) {
            $query->whereDate('created_at', '<=', $filters['dateTo']);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get failed login attempts
     */
    public function getFailedLoginAttempts(int $hours = 24): array
    {
        $logs = AdminActivityLog::where('action_type', 'failed_login')
            ->where('created_at', '>=', now()->subHours($hours))
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'description' => $log->description,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            })
            ->toArray();

        return $logs;
    }

    /**
     * Get active sessions count (approximate by recent activity)
     */
    public function getActiveSessions(): array
    {
        $activeSessions = DB::table('sessions')
            ->where('last_activity', '>=', now()->subMinutes(30)->getTimestamp())
            ->count();

        $totalSessions = DB::table('sessions')->count();

        return [
            'active' => $activeSessions,
            'total' => $totalSessions,
        ];
    }

    /**
     * Get 2FA statistics
     */
    public function get2FAStats(): array
    {
        $totalUsers = User::count();
        $enabled = User::where('two_fa_enabled', true)->count();
        $disabled = $totalUsers - $enabled;

        return [
            'total_users' => $totalUsers,
            'enabled' => $enabled,
            'disabled' => $disabled,
            'adoption_rate' => $totalUsers > 0 ? round(($enabled / $totalUsers) * 100, 1) : 0,
        ];
    }

    /**
     * Get distinct action types for filtering
     */
    public function getActionTypes(): array
    {
        return AdminActivityLog::select('action_type')
            ->distinct()
            ->pluck('action_type')
            ->toArray();
    }

    /**
     * Get distinct resource types for filtering
     */
    public function getResourceTypes(): array
    {
        return AdminActivityLog::select('resource_type')
            ->distinct()
            ->whereNotNull('resource_type')
            ->pluck('resource_type')
            ->toArray();
    }
}
