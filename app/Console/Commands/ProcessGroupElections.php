<?php

namespace App\Console\Commands;

use App\Actions\GuestServices\AuthAccessServices\GroupElectionService;
use Illuminate\Console\Command;

class ProcessGroupElections extends Command
{
    protected $signature = 'groups:process-elections';

    protected $description = 'Process ended group elections and determine winners';

    public function handle(GroupElectionService $electionService): int
    {
        $processed = $electionService->processEndedElections();

        $this->info("Processed {$processed} ended election(s).");

        return Command::SUCCESS;
    }
}
