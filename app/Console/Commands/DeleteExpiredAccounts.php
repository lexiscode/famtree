<?php

namespace App\Console\Commands;

use App\Models\GuestModels\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class DeleteExpiredAccounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'accounts:delete-expired {--force : Actually delete the accounts without confirmation}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Permanently delete soft-deleted accounts that have expired (30 days since deletion)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Get all soft-deleted accounts that are past their scheduled deletion date
        $expiredAccounts = User::onlyTrashed()
            ->where('scheduled_deletion_at', '<=', Carbon::now())
            ->get();

        if ($expiredAccounts->isEmpty()) {
            $this->info('No expired accounts to delete.');
            return Command::SUCCESS;
        }

        $this->info("Found {$expiredAccounts->count()} expired account(s) to delete.");

        if (!$this->option('force')) {
            if (!$this->confirm('Do you want to permanently delete these accounts?')) {
                return Command::SUCCESS;
            }
        }

        foreach ($expiredAccounts as $user) {
            $user->forceDelete();
            $this->line("  ✓ Permanently deleted account: {$user->email} (ID: {$user->id})");
        }

        $this->info("✓ Successfully deleted {$expiredAccounts->count()} account(s).");

        return Command::SUCCESS;
    }
}
