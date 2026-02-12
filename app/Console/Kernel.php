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

        // Deceased Verification System Commands
        // Check for inactive users (6+ months) and initiate reengagement
        // Runs daily at 2:00 AM
        $schedule->command('deceased:check-inactive')
            ->daily()
            ->at('02:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('deceased-check-inactive');

        // Process reengagement stage to family check (12+ months inactive)
        // Runs daily at 3:00 AM
        $schedule->command('deceased:process-reengagement')
            ->daily()
            ->at('03:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('deceased-process-reengagement');

        // Process family responses and determine next steps
        // Runs daily at 4:00 AM
        $schedule->command('deceased:process-family-responses')
            ->daily()
            ->at('04:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('deceased-process-family-responses');

        // Execute pending status changes (30-day waiting period passed)
        // Runs daily at 5:00 AM
        $schedule->command('deceased:execute-pending-changes')
            ->daily()
            ->at('05:00')
            ->onOneServer()
            ->withoutOverlapping()
            ->name('deceased-execute-pending-changes');

        // Process pending scheduled/recurring organization broadcasts
        // Runs every minute to check for broadcasts ready to send
        $schedule->command('org:process-broadcasts')
            ->everyMinute()
            ->onOneServer()
            ->withoutOverlapping()
            ->name('org-process-broadcasts');
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
