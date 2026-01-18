<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\DeceasedVerificationService;
use App\Actions\GuestServices\MemorialEmailService;
use Illuminate\Console\Command;

class ProcessReengagementStageCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deceased:process-reengagement';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process verifications at reengagement stage that are ready for family check (12+ months inactive)';

    /**
     * Execute the console command.
     */
    public function handle(
        DeceasedVerificationService $verificationService,
        MemorialEmailService $emailService
    ): int {
        $this->info('Processing reengagement verifications ready for family check...');

        $verifications = $verificationService->getVerificationsReadyForFamilyCheck();

        $this->info("Found {$verifications->count()} verifications ready for family check.");

        $processed = 0;
        foreach ($verifications as $verification) {
            try {
                // Progress to family check stage
                $updatedVerification = $verificationService->progressToFamilyCheck($verification);

                // Send notifications to close family members
                $sentCount = $emailService->sendFamilyCheckEmails($updatedVerification, $verificationService);

                if ($sentCount > 0) {
                    $processed++;
                    $this->line("  - Progressed to family check for user ID {$verification->user_id}, sent {$sentCount} emails");
                } else {
                    $this->warn("  - User ID {$verification->user_id} has no close family members to notify");
                }
            } catch (\Exception $e) {
                $this->error("  - Failed for verification {$verification->id}: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$processed} verifications to family check stage.");

        return Command::SUCCESS;
    }
}
