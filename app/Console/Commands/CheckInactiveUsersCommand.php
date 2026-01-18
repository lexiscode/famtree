<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\DeceasedVerificationService;
use App\Actions\GuestServices\MemorialEmailService;
use Illuminate\Console\Command;

class CheckInactiveUsersCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deceased:check-inactive';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for users who have been inactive for 6+ months and initiate reengagement';

    /**
     * Execute the console command.
     */
    public function handle(
        DeceasedVerificationService $verificationService,
        MemorialEmailService $emailService
    ): int {
        $this->info('Checking for inactive users...');

        $threshold = config('memorial.reengagement_threshold', 6);
        $inactiveUsers = $verificationService->findInactiveUsers($threshold);

        $this->info("Found {$inactiveUsers->count()} inactive users without active verification.");

        $initiated = 0;
        foreach ($inactiveUsers as $user) {
            try {
                // Create verification at reengagement stage
                $verification = $verificationService->initiateReengagement($user);

                // Send reengagement email
                $emailService->sendReengagementEmail($user);

                $initiated++;
                $this->line("  - Initiated reengagement for: {$user->email}");
            } catch (\Exception $e) {
                $this->error("  - Failed for {$user->email}: {$e->getMessage()}");
            }
        }

        $this->info("Initiated reengagement for {$initiated} users.");

        return Command::SUCCESS;
    }
}
