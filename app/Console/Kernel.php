<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Delete expired user accounts (those scheduled for deletion 30 days ago)
        // Runs daily at 12:00 AM
        $schedule->command('accounts:delete-expired --force')
            ->daily()
            ->at('00:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('delete-expired-accounts');

        // Cleanup old chat messages (older than 7 days)
        // Runs weekly on Sunday at 2:00 AM
        $schedule->command('chat:cleanup --days=7')
            ->weekly()
            ->sundays()
            ->at('02:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('cleanup-old-chat-messages');
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
