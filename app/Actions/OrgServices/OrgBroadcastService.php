<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgBroadcastRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Models\OrgModels\OrgBroadcast;
use App\Models\GuestModels\ClassSet;
use App\Events\ClassSetMessageSent;
use Illuminate\Pagination\LengthAwarePaginator;

class OrgBroadcastService
{
    public function __construct(
        private OrgBroadcastRepository $broadcastRepo,
        private ClassSetRepository $classSetRepo,
        private ClassSetMessageRepository $messageRepo,
    ) {}

    public function getBroadcasts(int $organizationId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->broadcastRepo->getByOrganization($organizationId, $perPage);
    }

    public function createBroadcast(array $data): OrgBroadcast
    {
        if ($data['schedule_type'] === 'immediate') {
            $data['status'] = 'pending';
        } else {
            $data['status'] = 'draft';
            if ($data['schedule_type'] === 'scheduled' && isset($data['scheduled_at'])) {
                $data['next_send_at'] = $data['scheduled_at'];
                $data['status'] = 'pending';
            }
            if ($data['schedule_type'] === 'recurring') {
                $data['next_send_at'] = $data['scheduled_at'] ?? now();
                $data['recurrences_sent'] = 0;
                $data['status'] = 'pending';
            }
        }

        $broadcast = $this->broadcastRepo->create($data);

        // Send immediately if schedule_type is immediate
        if ($broadcast->schedule_type === 'immediate') {
            $this->sendBroadcast($broadcast);
        }

        return $broadcast;
    }

    /**
     * Send a broadcast to all target class sets
     */
    public function sendBroadcast(OrgBroadcast $broadcast): void
    {
        $classSetIds = $this->resolveTargetClassSets($broadcast);

        if (empty($classSetIds)) {
            $this->broadcastRepo->update($broadcast->id, [
                'status' => 'sent',
                'sent_at' => now(),
                'sent_to_count' => 0,
            ]);
            return;
        }

        $sentCount = 0;

        foreach ($classSetIds as $classSetId) {
            try {
                $classSet = $this->classSetRepo->find($classSetId);
                if (!$classSet) continue;

                $chatMessage = $this->messageRepo->createBroadcastMessage(
                    $classSetId,
                    $broadcast->message,
                    $broadcast->id,
                    $broadcast->org_account_id,
                    $broadcast->organization_id
                );

                // Load relationships for the broadcast event
                $chatMessage->load(['organization', 'orgAccount']);

                broadcast(new ClassSetMessageSent($chatMessage, $classSet));

                $sentCount++;
            } catch (\Throwable $e) {
                // Log but continue sending to other groups
                \Log::error("Broadcast delivery failed for class_set {$classSetId}: " . $e->getMessage());
            }
        }

        $this->broadcastRepo->update($broadcast->id, [
            'status' => $sentCount === count($classSetIds) ? 'sent' : 'partially_sent',
            'sent_at' => now(),
            'sent_to_count' => $sentCount,
            'recurrences_sent' => $broadcast->recurrences_sent + 1,
        ]);
    }

    /**
     * Resolve target class set IDs based on broadcast target_type
     */
    private function resolveTargetClassSets(OrgBroadcast $broadcast): array
    {
        if ($broadcast->target_type === 'selected_groups' && !empty($broadcast->target_class_set_ids)) {
            return $broadcast->target_class_set_ids;
        }

        // For all_groups: get all class sets belonging to this organization
        $org = \App\Models\GuestModels\Organization::with('faculties.departments.classSets')
            ->find($broadcast->organization_id);

        if (!$org) return [];

        $ids = [];
        foreach ($org->faculties as $faculty) {
            foreach ($faculty->departments as $dept) {
                foreach ($dept->classSets as $classSet) {
                    $ids[] = $classSet->id;
                }
            }
        }

        return $ids;
    }

    public function getBroadcast(int $id, int $organizationId): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        return $broadcast;
    }

    public function cancelBroadcast(int $id, int $organizationId): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        if (in_array($broadcast->status, ['sent', 'cancelled'])) {
            return null;
        }

        return $this->broadcastRepo->update($id, ['status' => 'cancelled']);
    }
}
