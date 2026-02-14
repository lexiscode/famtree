<?php

namespace App\Actions\AdminServices;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class EmailService
{
    /**
     * Get email history from the failed_jobs table and activity logs
     */
    public function getEmailHistory(int $perPage = 20, int $page = 1): array
    {
        // Get email-related activity logs as a proxy for email history
        $emailLogs = AdminActivityLog::where('action_type', 'like', '%email%')
            ->orWhere('action_type', 'like', '%mail%')
            ->orWhere('resource_type', 'Email')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'emails' => $emailLogs->through(function ($log) {
                return [
                    'id' => $log->id,
                    'action_type' => $log->action_type,
                    'description' => $log->description,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s'),
                    'created_at_formatted' => $log->created_at->diffForHumans(),
                ];
            }),
        ];
    }

    /**
     * Get failed emails from the failed_jobs table
     */
    public function getFailedEmails(int $perPage = 20, int $page = 1): array
    {
        $failedJobs = DB::table('failed_jobs')
            ->where('payload', 'like', '%mail%')
            ->orWhere('payload', 'like', '%Mail%')
            ->orderBy('failed_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formatted = collect($failedJobs->items())->map(function ($job) {
            return [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'connection' => $job->connection,
                'queue' => $job->queue,
                'exception' => \Illuminate\Support\Str::limit($job->exception, 500),
                'failed_at' => $job->failed_at,
            ];
        });

        return [
            'failedEmails' => [
                'data' => $formatted,
                'total' => $failedJobs->total(),
                'per_page' => $failedJobs->perPage(),
                'current_page' => $failedJobs->currentPage(),
                'last_page' => $failedJobs->lastPage(),
            ],
        ];
    }

    /**
     * Send a test email to verify email configuration
     */
    public function sendTestEmail(string $recipientEmail): bool
    {
        try {
            Mail::raw('This is a test email from FamTree Admin Panel. If you received this, email configuration is working correctly.', function ($message) use ($recipientEmail) {
                $message->to($recipientEmail)
                    ->subject('FamTree - Test Email');
            });

            $this->logActivity('send_test_email', 'Email', 0, "Sent test email to: {$recipientEmail}");

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
