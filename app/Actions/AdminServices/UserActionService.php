<?php

namespace App\Actions\AdminServices;

use App\Models\GuestModels\User;
use App\Repositories\AdminRepositories\UserRepository;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class UserActionService
{
    /**
     * Create service with injected repository
     */
    public function __construct(private UserRepository $userRepository)
    {
    }

    /**
     * Suspend user account
     */
    public function suspendUser(int $userId, string $reason = ''): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Update user account status
            $this->userRepository->update($userId, ['account_status' => 'suspended']);

            // Log activity
            $this->logActivity('suspend_user', 'User', $userId, "Suspended user account. Reason: {$reason}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Unsuspend/reactivate user account
     */
    public function unsuspendUser(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Update user account status to active
            $this->userRepository->update($userId, ['account_status' => 'active']);

            // Log activity
            $this->logActivity('unsuspend_user', 'User', $userId, 'User account reactivated');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Deactivate user account
     */
    public function deactivateUser(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Update user account status to inactive
            $this->userRepository->update($userId, ['account_status' => 'inactive']);

            // Log activity
            $this->logActivity('deactivate_user', 'User', $userId, 'User account deactivated');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Ban user account (soft delete)
     */
    public function banUser(int $userId, string $reason = ''): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Soft delete user
            $this->userRepository->softDelete($userId);

            // Log activity
            $this->logActivity('ban_user', 'User', $userId, "User account banned. Reason: {$reason}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Schedule user account for deletion
     */
    public function scheduleUserDeletion(int $userId, int $daysUntilDeletion = 30): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            $deletionDate = now()->addDays($daysUntilDeletion);

            // Update user with scheduled deletion date
            $this->userRepository->update($userId, ['scheduled_deletion_at' => $deletionDate]);

            // Log activity
            $this->logActivity('schedule_deletion', 'User', $userId, "User account scheduled for deletion on {$deletionDate->format('Y-m-d')}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Cancel scheduled user deletion
     */
    public function cancelScheduledDeletion(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user || !$user->scheduled_deletion_at) {
                return false;
            }

            // Remove scheduled deletion date
            $this->userRepository->update($userId, ['scheduled_deletion_at' => null]);

            // Log activity
            $this->logActivity('cancel_deletion', 'User', $userId, 'Scheduled deletion cancelled');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reset user password and send reset link
     */
    public function resetUserPassword(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Send password reset notification
            // This will send an email to the user with a password reset link
            Password::broker()->sendResetLink(['email' => $user->email]);

            // Log activity
            $this->logActivity('reset_password', 'User', $userId, 'Password reset link sent to user');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Force reset user password to a temporary one
     */
    public function forceResetPassword(int $userId, string $tempPassword): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Update password
            $this->userRepository->update($userId, ['password' => Hash::make($tempPassword)]);

            // Log activity
            $this->logActivity('force_reset_password', 'User', $userId, 'Admin forced password reset');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Disable 2FA for user
     */
    public function disable2FA(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Disable 2FA
            $this->userRepository->update($userId, [
                'two_fa_enabled' => false,
                'two_fa_secret' => null,
                'two_fa_backup_codes' => null,
            ]);

            // Log activity
            $this->logActivity('disable_2fa', 'User', $userId, 'Two-factor authentication disabled');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Force enable 2FA for user
     */
    public function enable2FA(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Enable 2FA (note: this doesn't set secret, that's done during setup)
            $this->userRepository->update($userId, ['two_fa_enabled' => true]);

            // Log activity
            $this->logActivity('enable_2fa', 'User', $userId, 'Two-factor authentication enabled');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Complete onboarding for user
     */
    public function completeOnboarding(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Mark onboarding as complete
            $this->userRepository->update($userId, ['onboarding_completed' => true]);

            // Log activity
            $this->logActivity('complete_onboarding', 'User', $userId, 'Onboarding marked as complete');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Reset onboarding for user
     */
    public function resetOnboarding(int $userId): bool
    {
        try {
            $user = $this->userRepository->find($userId);

            if (!$user) {
                return false;
            }

            // Mark onboarding as incomplete
            $this->userRepository->update($userId, ['onboarding_completed' => false]);

            // Log activity
            $this->logActivity('reset_onboarding', 'User', $userId, 'Onboarding reset');

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
            // Silently fail - don't break the main operation
        }
    }

    /**
     * Get user action history
     */
    public function getUserActionHistory(int $userId, int $limit = 50)
    {
        return AdminActivityLog::where('resource_type', 'User')
            ->where('resource_id', $userId)
            ->with('admin')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action_type,
                    'description' => $log->description,
                    'admin' => $log->admin?->username ?? 'System',
                    'timestamp' => $log->created_at->diffForHumans(),
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                ];
            });
    }
}
