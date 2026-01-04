<?php

namespace App\Console\Commands;

use App\Models\GuestModels\TreeChatMessage;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CleanupOldChatMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:cleanup {--days=7 : Number of days to keep messages}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete chat messages older than specified days to free up database space';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int) $this->option('days');
        $cutoffDate = Carbon::now()->subDays($days);

        $this->info("Cleaning up chat messages older than {$days} days (before {$cutoffDate->format('Y-m-d H:i:s')})...");

        // Count messages to be deleted
        $count = TreeChatMessage::where('created_at', '<', $cutoffDate)->count();

        if ($count === 0) {
            $this->info('No old messages found to delete.');
            return Command::SUCCESS;
        }

        // Confirm deletion
        if ($this->confirm("Found {$count} message(s) to delete. Continue?", true)) {
            // Delete old messages
            $deleted = TreeChatMessage::where('created_at', '<', $cutoffDate)->delete();

            $this->info("Successfully deleted {$deleted} message(s).");
            $this->comment("Freed up database space by removing messages older than {$days} days.");

            return Command::SUCCESS;
        }

        $this->warn('Cleanup cancelled.');
        return Command::FAILURE;
    }
}
