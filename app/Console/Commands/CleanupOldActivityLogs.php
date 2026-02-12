<?php

namespace App\Console\Commands;

use App\Models\OrgModels\OrgActivityLog;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupOldActivityLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'org:cleanup-activity-logs {--days=14 : Number of days to keep logs}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete organization activity logs older than specified days';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Cleaning up activity logs older than {$days} days (before {$cutoffDate->format('Y-m-d H:i:s')})...");

        $count = OrgActivityLog::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No old activity logs found to delete.');
            return Command::SUCCESS;
        }

        if ($this->confirm("Found {$count} activity log(s) to delete. Continue?", true)) {
            $deleted = OrgActivityLog::where('created_at', '<', $cutoffDate)->delete();

            $this->info("Successfully deleted {$deleted} activity log(s).");
            return Command::SUCCESS;
        }

        $this->warn('Cleanup cancelled.');
        return Command::FAILURE;
    }
}
