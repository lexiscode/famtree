<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\SecurityRepository;
use App\Models\AdminActivityLog;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class SecurityService
{
    public function __construct(private SecurityRepository $repository)
    {
    }

    /**
     * Get security dashboard data
     */
    public function getDashboardData(): array
    {
        $twoFaStats = $this->repository->get2FAStats();
        $failedLogins = $this->repository->getFailedLoginAttempts(24);
        $sessions = $this->repository->getActiveSessions();

        // Recent suspicious activity
        $suspiciousActivity = AdminActivityLog::whereIn('action_type', [
            'failed_login', 'ban_user', 'suspend_user', 'force_logout',
        ])
            ->where('created_at', '>=', now()->subDays(7))
            ->orderBy('created_at', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action_type' => $log->action_type,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'created_at_formatted' => $log->created_at->diffForHumans(),
                ];
            });

        // Suspended/banned users count
        $suspendedUsers = User::where('account_status', 'suspended')->count();
        $bannedUsers = User::where('account_status', 'banned')->count();

        return [
            'twoFaStats' => $twoFaStats,
            'failedLogins' => [
                'count' => count($failedLogins),
                'recent' => array_slice($failedLogins, 0, 10),
            ],
            'sessions' => $sessions,
            'suspiciousActivity' => $suspiciousActivity,
            'suspendedUsers' => $suspendedUsers,
            'bannedUsers' => $bannedUsers,
        ];
    }

    /**
     * Get audit log with pagination and filters
     */
    public function getAuditLog(int $perPage = 20, int $page = 1, array $filters = []): array
    {
        $logs = $this->repository->getAdminActivityLogs($perPage, $page, $filters);

        $formattedLogs = $logs->through(function ($log) {
            return [
                'id' => $log->id,
                'admin' => $log->admin?->username ?? 'System',
                'admin_id' => $log->admin_id,
                'action_type' => $log->action_type,
                'resource_type' => $log->resource_type,
                'resource_id' => $log->resource_id,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                'created_at_formatted' => $log->created_at->diffForHumans(),
            ];
        });

        $actionTypes = $this->repository->getActionTypes();
        $resourceTypes = $this->repository->getResourceTypes();

        return [
            'logs' => $formattedLogs,
            'actionTypes' => $actionTypes,
            'resourceTypes' => $resourceTypes,
        ];
    }

    /**
     * Force logout a user by invalidating their sessions
     */
    public function forceLogoutUser(int $userId): bool
    {
        try {
            $user = User::find($userId);

            if (!$user) {
                return false;
            }

            // Delete user sessions
            DB::table('sessions')->where('user_id', $userId)->delete();

            $this->logActivity('force_logout', 'User', $userId, "Force logged out user: {$user->username}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Export user data for GDPR/privacy compliance
     */
    public function exportUserData(int $userId): ?array
    {
        try {
            $user = User::with([
                'posts', 'galleries', 'notifications',
            ])->find($userId);

            if (!$user) {
                return null;
            }

            $data = [
                'personal_info' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'address' => $user->address,
                    'bio' => $user->bio,
                    'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                    'gender' => $user->gender,
                    'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                ],
                'posts_count' => $user->posts->count(),
                'galleries_count' => $user->galleries->count(),
                'notifications_count' => $user->notifications->count(),
                'exported_at' => now()->format('Y-m-d H:i:s'),
            ];

            $this->logActivity('export_user_data', 'User', $userId, "Exported data for user: {$user->username}");

            return $data;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Anonymize user data for GDPR compliance
     */
    public function anonymizeUser(int $userId): bool
    {
        try {
            $user = User::find($userId);

            if (!$user) {
                return false;
            }

            $originalUsername = $user->username;

            $user->update([
                'first_name' => 'Anonymized',
                'last_name' => 'User',
                'username' => 'anonymized_' . $user->id,
                'email' => 'anonymized_' . $user->id . '@deleted.famtree.com',
                'phone' => null,
                'address' => null,
                'bio' => null,
                'date_of_birth' => null,
                'profile_image' => null,
                'profile_image_url' => null,
                'account_status' => 'deactivated',
            ]);

            $this->logActivity('anonymize_user', 'User', $userId, "Anonymized user data for: {$originalUsername}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
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
