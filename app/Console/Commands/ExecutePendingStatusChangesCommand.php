<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\DeceasedVerificationService;
use App\Actions\GuestServices\MemorialEmailService;
use App\Actions\GuestServices\MemorialService;
use Illuminate\Console\Command;

class ExecutePendingStatusChangesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'deceased:execute-pending-changes';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Execute pending status changes where 30-day waiting period has passed';

    /**
     * Execute the console command.
     */
    public function handle(
        DeceasedVerificationService $verificationService,
        MemorialService $memorialService,
        MemorialEmailService $emailService
    ): int {
        $this->info('Executing pending status changes...');

        $verifications = $verificationService->getVerificationsReadyForStatusChange();

        $this->info("Found {$verifications->count()} verifications ready for status change.");

        $executed = 0;
        foreach ($verifications as $verification) {
            try {
                $user = $verification->user;

                // Execute status change (mark as deceased and enable memorial mode)
                $verificationService->executeStatusChange($verification, $memorialService);

                // Send memorial created notifications to family
                $emailService->sendMemorialCreatedEmails($user, $memorialService);

                $executed++;
                $this->line("  - Memorialized user: {$user->email}");
            } catch (\Exception $e) {
                $this->error("  - Failed for verification {$verification->id}: {$e->getMessage()}");
            }
        }

        $this->info("Executed {$executed} status changes.");

        return Command::SUCCESS;
    }
}
