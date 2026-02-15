<?php

namespace App\Console\Commands;

use App\Models\GuestModels\GlamChallenge;
use App\Actions\GuestServices\AuthAccessServices\GlamScoringService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class GlamChallengeLifecycle extends Command
{
    protected $signature = 'glam:lifecycle';

    protected $description = 'Auto-transition glam challenges based on scheduled dates';

    public function handle(GlamScoringService $scoringService): int
    {
        $now = Carbon::now();
        $transitioned = 0;

        // upcoming → submissions_open
        $upcoming = GlamChallenge::where('status', 'upcoming')
            ->whereNotNull('submissions_open_at')
            ->where('submissions_open_at', '<=', $now)
            ->get();

        foreach ($upcoming as $challenge) {
            $challenge->update(['status' => 'submissions_open']);
            $transitioned++;
            $this->info("Challenge #{$challenge->id} → submissions_open");
        }

        // submissions_open → voting_open
        $submissionsOpen = GlamChallenge::where('status', 'submissions_open')
            ->whereNotNull('voting_open_at')
            ->where('voting_open_at', '<=', $now)
            ->get();

        foreach ($submissionsOpen as $challenge) {
            $challenge->update(['status' => 'voting_open']);
            $transitioned++;
            $this->info("Challenge #{$challenge->id} → voting_open");
        }

        // voting_open → completed (triggers scoring)
        $votingOpen = GlamChallenge::where('status', 'voting_open')
            ->whereNotNull('results_at')
            ->where('results_at', '<=', $now)
            ->get();

        foreach ($votingOpen as $challenge) {
            $challenge->update(['status' => 'completed']);
            $scoringService->scoreChallenge($challenge->id);
            $transitioned++;
            $this->info("Challenge #{$challenge->id} → completed (scored)");
        }

        $this->info("Lifecycle check complete. {$transitioned} challenge(s) transitioned.");

        return Command::SUCCESS;
    }
}
