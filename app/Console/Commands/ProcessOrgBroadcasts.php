<?php

namespace App\Console\Commands;

use App\Actions\OrgServices\OrgBroadcastService;
use App\Models\OrgModels\OrgBroadcast;
use Illuminate\Console\Command;

class ProcessOrgBroadcasts extends Command
{
    protected $signature = 'org:process-broadcasts';

    protected $description = 'Process pending scheduled and recurring organization broadcasts';

    public function handle(OrgBroadcastService $broadcastService): int
    {
        $broadcasts = OrgBroadcast::where('status', 'pending')
            ->whereNotNull('next_send_at')
            ->where('next_send_at', '<=', now())
            ->where('schedule_type', '!=', 'immediate')
            ->get();

        if ($broadcasts->isEmpty()) {
            $this->info('No pending broadcasts to process.');
            return self::SUCCESS;
        }

        foreach ($broadcasts as $broadcast) {
            try {
                $this->info("Processing broadcast #{$broadcast->id}: {$broadcast->title}");

                // Remember the original next_send_at to preserve the time for recurring
                $originalNextSendAt = $broadcast->next_send_at->copy();

                $broadcastService->sendBroadcast($broadcast);

                // Handle recurring broadcasts
                if ($broadcast->schedule_type === 'recurring') {
                    $freshBroadcast = $broadcast->fresh();
                    $maxRecurrences = $freshBroadcast->recurrence_count;
                    $sent = $freshBroadcast->recurrences_sent;

                    // Check if max recurrences reached
                    if ($maxRecurrences && $sent >= $maxRecurrences) {
                        $freshBroadcast->update([
                            'status' => 'sent',
                            'next_send_at' => null,
                        ]);
                        $this->info("  Recurring broadcast completed ({$sent}/{$maxRecurrences} sends).");
                    } else {
                        // Calculate the next send time (preserving original time of day)
                        $nextSend = match ($freshBroadcast->recurrence_type) {
                            'daily' => $originalNextSendAt->addDay(),
                            'weekly' => $originalNextSendAt->addWeek(),
                            'monthly' => $originalNextSendAt->addMonth(),
                            default => null,
                        };

                        if ($nextSend) {
                            $freshBroadcast->update([
                                'status' => 'pending',
                                'next_send_at' => $nextSend,
                            ]);
                            $this->info("  Next send scheduled for {$nextSend->toDateTimeString()}.");
                        }
                    }
                }

                $this->info("  Broadcast #{$broadcast->id} processed successfully.");
            } catch (\Throwable $e) {
                $this->error("  Failed to process broadcast #{$broadcast->id}: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
