<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgBroadcastRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Models\OrgModels\OrgBroadcast;
use App\Models\GuestModels\ClassSet;
use App\Events\ClassSetMessageSent;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrgBroadcastService
{
    public function __construct(
        private OrgBroadcastRepository $broadcastRepo,
        private ClassSetRepository $classSetRepo,
        private ClassSetMessageRepository $messageRepo,
    ) {}

    public function getBroadcasts(int $organizationId, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        return $this->broadcastRepo->getByOrganization($organizationId, $perPage, $filters);
    }

    public function createBroadcast(array $data): OrgBroadcast
    {
        // If requires approval, set approval_status to pending regardless of schedule
        if (!empty($data['requires_approval'])) {
            $data['requires_approval'] = true;
            $data['approval_status'] = 'pending';
            // Don't send immediately even if schedule_type is immediate — wait for approval
            $data['status'] = 'draft';
            if ($data['schedule_type'] === 'scheduled' && isset($data['scheduled_at'])) {
                $data['next_send_at'] = $data['scheduled_at'];
            } elseif ($data['schedule_type'] === 'recurring') {
                $data['next_send_at'] = $data['scheduled_at'] ?? now();
                $data['recurrences_sent'] = 0;
            }
            return $this->broadcastRepo->create($data);
        }

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
        $deliveryDetails = [];

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
                $deliveryDetails[] = [
                    'class_set_id' => $classSetId,
                    'class_set_name' => $classSet->name,
                    'status' => 'delivered',
                    'sent_at' => now()->toDateTimeString(),
                ];
            } catch (\Throwable $e) {
                \Log::error("Broadcast delivery failed for class_set {$classSetId}: " . $e->getMessage());
                $deliveryDetails[] = [
                    'class_set_id' => $classSetId,
                    'status' => 'failed',
                    'error' => $e->getMessage(),
                ];
            }
        }

        $this->broadcastRepo->update($broadcast->id, [
            'status' => $sentCount === count($classSetIds) ? 'sent' : 'partially_sent',
            'sent_at' => now(),
            'sent_to_count' => $sentCount,
            'delivery_details' => $deliveryDetails,
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

    public function updateBroadcast(int $id, int $organizationId, array $data): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        if (in_array($broadcast->status, ['sent', 'cancelled'])) {
            return null;
        }

        // Recalculate next_send_at based on new schedule settings
        if ($data['schedule_type'] === 'immediate') {
            $data['status'] = 'pending';
            $data['next_send_at'] = null;
            $data['recurrence_type'] = null;
            $data['recurrence_count'] = null;
            $data['recurrences_sent'] = 0;
        } elseif ($data['schedule_type'] === 'scheduled' && isset($data['scheduled_at'])) {
            $data['next_send_at'] = $data['scheduled_at'];
            $data['status'] = 'pending';
            $data['recurrence_type'] = null;
            $data['recurrence_count'] = null;
            $data['recurrences_sent'] = 0;
        } elseif ($data['schedule_type'] === 'recurring') {
            $data['next_send_at'] = $data['scheduled_at'] ?? now();
            $data['recurrences_sent'] = 0;
            $data['status'] = 'pending';
        }

        // If broadcast requires approval, keep status as draft until approved
        if ($broadcast->requires_approval && $broadcast->approval_status !== 'approved') {
            $data['status'] = 'draft';
        }

        $updated = $this->broadcastRepo->update($id, $data);

        // Send immediately if changed to immediate and approved
        if ($updated && $updated->schedule_type === 'immediate' && $updated->isApproved()) {
            $this->sendBroadcast($updated);
        }

        return $updated;
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

    // Approval workflow
    public function approveBroadcast(int $id, int $organizationId, int $approvedBy): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        if (!$broadcast->requires_approval || $broadcast->approval_status !== 'pending') {
            return null;
        }

        $updateData = [
            'approval_status' => 'approved',
            'approved_by' => $approvedBy,
            'approved_at' => now(),
        ];

        // Now set the proper status based on schedule type
        if ($broadcast->schedule_type === 'immediate') {
            $updateData['status'] = 'pending';
        } elseif ($broadcast->schedule_type === 'scheduled' || $broadcast->schedule_type === 'recurring') {
            $updateData['status'] = 'pending';
        }

        $updated = $this->broadcastRepo->update($id, $updateData);

        // Send immediately if schedule_type is immediate
        if ($updated && $updated->schedule_type === 'immediate') {
            $this->sendBroadcast($updated);
        }

        return $updated;
    }

    public function rejectBroadcast(int $id, int $organizationId, int $rejectedBy, string $reason): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        if (!$broadcast->requires_approval || $broadcast->approval_status !== 'pending') {
            return null;
        }

        return $this->broadcastRepo->update($id, [
            'approval_status' => 'rejected',
            'approved_by' => $rejectedBy,
            'approved_at' => now(),
            'rejection_reason' => $reason,
            'status' => 'cancelled',
        ]);
    }

    // Moderation
    public function flagBroadcast(int $id, int $organizationId, int $flaggedBy, string $reason): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        return $this->broadcastRepo->update($id, [
            'is_flagged' => true,
            'flag_reason' => $reason,
            'flagged_by' => $flaggedBy,
            'flagged_at' => now(),
        ]);
    }

    public function unflagBroadcast(int $id, int $organizationId): ?OrgBroadcast
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        return $this->broadcastRepo->update($id, [
            'is_flagged' => false,
            'flag_reason' => null,
            'flagged_by' => null,
            'flagged_at' => null,
        ]);
    }

    // Analytics
    public function getAnalytics(int $id, int $organizationId): ?array
    {
        $broadcast = $this->broadcastRepo->findById($id);

        if (!$broadcast || $broadcast->organization_id !== $organizationId) {
            return null;
        }

        $readCount = $this->broadcastRepo->getReadCount($id);
        $readsByClassSet = $this->broadcastRepo->getReadsByClassSet($id);
        $recentReads = $this->broadcastRepo->getRecentReads($id);

        return [
            'broadcast_id' => $id,
            'total_sent' => $broadcast->sent_to_count,
            'total_reads' => $readCount,
            'delivery_details' => $broadcast->delivery_details ?? [],
            'reads_by_class_set' => $readsByClassSet->map(fn($r) => [
                'class_set_id' => $r->class_set_id,
                'read_count' => $r->read_count,
            ])->toArray(),
            'recent_reads' => $recentReads->map(fn($r) => [
                'user' => [
                    'id' => $r->user->id,
                    'first_name' => $r->user->first_name,
                    'last_name' => $r->user->last_name,
                    'username' => $r->user->username,
                    'profile_image' => $r->user->profile_image_url ?? null,
                ],
                'read_at' => $r->read_at->toDateTimeString(),
            ])->toArray(),
        ];
    }

    public function getPendingApprovalCount(int $organizationId): int
    {
        return $this->broadcastRepo->countPendingApproval($organizationId);
    }

    public function recordRead(int $broadcastId, int $classSetId, int $userId): void
    {
        $this->broadcastRepo->recordRead($broadcastId, $classSetId, $userId);
    }
}
