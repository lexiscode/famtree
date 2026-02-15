<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\AuthAccessServices\GroupRemovalService;
use Illuminate\Console\Command;

class ProcessPendingRemovals extends Command
{
    protected $signature = 'groups:process-removals';

    protected $description = 'Process expired pending member removals (auto-confirm after 3 days)';

    public function handle(GroupRemovalService $removalService): int
    {
        $processed = $removalService->processExpiredRemovals();

        $this->info("Processed {$processed} expired removal(s).");

        return Command::SUCCESS;
    }
}
