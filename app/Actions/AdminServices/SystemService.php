<?php

namespace App\Actions\AdminServices;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class SystemService
{
    /**
     * Get list of scheduled tasks
     */
    public function getScheduledTasks(): array
    {
        try {
            Artisan::call('schedule:list');
            $output = Artisan::output();

            $tasks = [];
            $lines = explode("\n", trim($output));

            foreach ($lines as $line) {
                $line = trim($line);
                if (empty($line) || str_starts_with($line, '-') || str_starts_with($line, '=')) {
                    continue;
                }

                $tasks[] = [
                    'description' => $line,
                ];
            }

            return $tasks;
        } catch (\Exception $e) {
            return [
                ['description' => 'Unable to retrieve scheduled tasks: ' . $e->getMessage()],
            ];
        }
    }

    /**
     * Get system health status
     */
    public function getHealthStatus(): array
    {
        $checks = [];

        // Database check
        try {
            DB::connection()->getPdo();
            $checks['database'] = [
                'status' => 'healthy',
                'message' => 'Database connection is active',
                'details' => [
                    'driver' => config('database.default'),
                    'database' => config('database.connections.' . config('database.default') . '.database'),
                ],
            ];
        } catch (\Exception $e) {
            $checks['database'] = [
                'status' => 'unhealthy',
                'message' => 'Database connection failed',
                'details' => ['error' => $e->getMessage()],
            ];
        }

        // Redis check
        try {
            Redis::ping();
            $checks['redis'] = [
                'status' => 'healthy',
                'message' => 'Redis connection is active',
            ];
        } catch (\Exception $e) {
            $checks['redis'] = [
                'status' => 'unhealthy',
                'message' => 'Redis connection failed',
                'details' => ['error' => $e->getMessage()],
            ];
        }

        // Disk space check
        try {
            $totalSpace = disk_total_space(base_path());
            $freeSpace = disk_free_space(base_path());
            $usedSpace = $totalSpace - $freeSpace;
            $usagePercent = round(($usedSpace / $totalSpace) * 100, 1);

            $checks['disk'] = [
                'status' => $usagePercent < 90 ? 'healthy' : 'warning',
                'message' => "Disk usage: {$usagePercent}%",
                'details' => [
                    'total' => $this->formatBytes($totalSpace),
                    'used' => $this->formatBytes($usedSpace),
                    'free' => $this->formatBytes($freeSpace),
                    'usage_percent' => $usagePercent,
                ],
            ];
        } catch (\Exception $e) {
            $checks['disk'] = [
                'status' => 'unknown',
                'message' => 'Unable to check disk space',
                'details' => ['error' => $e->getMessage()],
            ];
        }

        // Queue check
        try {
            $failedJobsCount = DB::table('failed_jobs')->count();
            $checks['queue'] = [
                'status' => $failedJobsCount === 0 ? 'healthy' : 'warning',
                'message' => $failedJobsCount === 0
                    ? 'No failed jobs'
                    : "{$failedJobsCount} failed job(s) found",
                'details' => [
                    'failed_jobs' => $failedJobsCount,
                    'driver' => config('queue.default'),
                ],
            ];
        } catch (\Exception $e) {
            $checks['queue'] = [
                'status' => 'unknown',
                'message' => 'Unable to check queue status',
                'details' => ['error' => $e->getMessage()],
            ];
        }

        // Cache check
        try {
            Cache::put('health_check_test', true, 10);
            $cacheWorks = Cache::get('health_check_test') === true;
            Cache::forget('health_check_test');

            $checks['cache'] = [
                'status' => $cacheWorks ? 'healthy' : 'unhealthy',
                'message' => $cacheWorks ? 'Cache is working' : 'Cache read/write failed',
                'details' => ['driver' => config('cache.default')],
            ];
        } catch (\Exception $e) {
            $checks['cache'] = [
                'status' => 'unhealthy',
                'message' => 'Cache check failed',
                'details' => ['error' => $e->getMessage()],
            ];
        }

        // Overall status
        $statuses = collect($checks)->pluck('status');
        $overallStatus = 'healthy';
        if ($statuses->contains('unhealthy')) {
            $overallStatus = 'unhealthy';
        } elseif ($statuses->contains('warning')) {
            $overallStatus = 'warning';
        }

        return [
            'overall' => $overallStatus,
            'checks' => $checks,
            'server' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'debug_mode' => config('app.debug'),
                'timezone' => config('app.timezone'),
                'uptime' => $this->getUptime(),
            ],
        ];
    }

    /**
     * Get failed jobs
     */
    public function getFailedJobs(int $perPage = 20, int $page = 1): array
    {
        $failedJobs = DB::table('failed_jobs')
            ->orderBy('failed_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $formatted = collect($failedJobs->items())->map(function ($job) {
            $payload = json_decode($job->payload, true);

            return [
                'id' => $job->id,
                'uuid' => $job->uuid,
                'connection' => $job->connection,
                'queue' => $job->queue,
                'job_name' => $payload['displayName'] ?? 'Unknown',
                'exception' => \Illuminate\Support\Str::limit($job->exception, 300),
                'failed_at' => $job->failed_at,
            ];
        });

        return [
            'data' => $formatted,
            'total' => $failedJobs->total(),
            'per_page' => $failedJobs->perPage(),
            'current_page' => $failedJobs->currentPage(),
            'last_page' => $failedJobs->lastPage(),
        ];
    }

    /**
     * Retry a failed job
     */
    public function retryJob(string $uuid): bool
    {
        try {
            Artisan::call('queue:retry', ['id' => [$uuid]]);

            $this->logActivity('retry_job', 'FailedJob', 0, "Retried failed job: {$uuid}");

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Run a scheduled task / artisan command
     */
    public function runTask(string $command): array
    {
        try {
            // Whitelist of allowed commands
            $allowedCommands = [
                'cache:clear',
                'config:clear',
                'view:clear',
                'route:clear',
                'schedule:run',
                'queue:retry',
                'migrate:status',
            ];

            if (!in_array($command, $allowedCommands)) {
                return [
                    'success' => false,
                    'output' => 'Command not allowed',
                ];
            }

            Artisan::call($command);
            $output = Artisan::output();

            $this->logActivity('run_task', 'System', 0, "Ran artisan command: {$command}");

            return [
                'success' => true,
                'output' => $output,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'output' => $e->getMessage(),
            ];
        }
    }

    /**
     * Format bytes to human-readable string
     */
    private function formatBytes(int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, $precision) . ' ' . $units[$pow];
    }

    /**
     * Get server uptime
     */
    private function getUptime(): string
    {
        try {
            if (PHP_OS_FAMILY === 'Linux') {
                $uptime = file_get_contents('/proc/uptime');
                $seconds = (int) explode(' ', $uptime)[0];
                $days = floor($seconds / 86400);
                $hours = floor(($seconds % 86400) / 3600);
                $minutes = floor(($seconds % 3600) / 60);

                return "{$days}d {$hours}h {$minutes}m";
            }
            return 'N/A';
        } catch (\Exception $e) {
            return 'N/A';
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
