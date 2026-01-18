<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\DeceasedVerificationService;
use App\Actions\GuestServices\MemorialEmailService;
use App\Repositories\GuestRepositories\DeceasedVerificationRepository;
use Illuminate\Console\Command;

class ProcessFamilyResponsesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deceased:process-family-responses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process family responses and determine next steps for verifications at family_check stage';

    /**
     * Execute the console command.
     */
    public function handle(
        DeceasedVerificationService $verificationService,
        DeceasedVerificationRepository $repository,
        MemorialEmailService $emailService
    ): int {
        $this->info('Processing family responses for verifications at family_check stage...');

        $verifications = $repository->getVerificationsAtStage('family_check');

        $this->info("Found {$verifications->count()} verifications at family_check stage.");

        $processed = 0;
        foreach ($verifications as $verification) {
            try {
                // Check if we have enough responses
                if (!$verificationService->hasEnoughResponses($verification)) {
                    $this->line("  - Verification {$verification->id}: Waiting for more responses");
                    continue;
                }

                // Calculate majority
                $majority = $verificationService->calculateMajority($verification);

                if ($majority === null) {
                    $this->line("  - Verification {$verification->id}: No clear majority yet");
                    continue;
                }

                if ($majority === 'alive') {
                    // Cancel the verification
                    $verificationService->cancelVerification($verification, 'Family confirmed alive');
                    $this->line("  - Verification {$verification->id}: Cancelled (family confirmed alive)");
                    $processed++;
                } elseif ($majority === 'deceased') {
                    // Schedule status change with 30-day waiting period
                    $updatedVerification = $verificationService->scheduleStatusChange($verification);

                    // Send notification to the inactive user
                    $emailService->sendStatusChangePendingEmail($verification->user, $updatedVerification);

                    $this->line("  - Verification {$verification->id}: Scheduled status change for user ID {$verification->user_id}");
                    $processed++;
                }
            } catch (\Exception $e) {
                $this->error("  - Failed for verification {$verification->id}: {$e->getMessage()}");
            }
        }

        $this->info("Processed {$processed} verifications.");

        return Command::SUCCESS;
    }
}
