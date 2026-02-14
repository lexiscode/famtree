<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\ElectionRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class ElectionService
{
    public function __construct(private ElectionRepository $repository)
    {
    }

    /**
     * Get all elections with pagination and formatting
     */
    public function getAllElections(array $filters = [], int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page, $filters)->through(function ($election) {
            return $this->formatElectionForList($election);
        });
    }

    /**
     * Get election details
     */
    public function getElectionDetails(int $id): ?array
    {
        $election = $this->repository->find($id);

        if (!$election) {
            return null;
        }

        return [
            'id' => $election->id,
            'type' => $election->type,
            'status' => $election->status,
            'positions_to_fill' => $election->positions_to_fill,
            'is_active' => $election->isActive(),
            'has_ended' => $election->hasEnded(),
            'candidates_count' => $election->candidates_count,
            'votes_count' => $election->votes_count,
            'started_at' => $election->started_at?->format('Y-m-d H:i:s'),
            'started_at_formatted' => $election->started_at?->diffForHumans() ?? 'N/A',
            'ends_at' => $election->ends_at?->format('Y-m-d H:i:s'),
            'ends_at_formatted' => $election->ends_at?->diffForHumans() ?? 'N/A',
            'class_set' => $election->classSet ? [
                'id' => $election->classSet->id,
                'uuid' => $election->classSet->uuid,
                'name' => $election->classSet->name,
                'year' => $election->classSet->year,
                'department' => $election->classSet->department ? [
                    'id' => $election->classSet->department->id,
                    'name' => $election->classSet->department->name,
                ] : null,
            ] : null,
            'parent_election' => $election->parentElection ? [
                'id' => $election->parentElection->id,
                'type' => $election->parentElection->type,
                'status' => $election->parentElection->status,
            ] : null,
            'candidates' => $election->candidates->map(function ($candidate) {
                return [
                    'id' => $candidate->id,
                    'votes_count' => $candidate->votes_count,
                    'user' => $candidate->user ? [
                        'id' => $candidate->user->id,
                        'first_name' => $candidate->user->first_name,
                        'last_name' => $candidate->user->last_name,
                        'full_name' => "{$candidate->user->first_name} {$candidate->user->last_name}",
                        'username' => $candidate->user->username,
                        'email' => $candidate->user->email,
                        'profile_image_url' => $candidate->user->profile_image_url,
                    ] : null,
                ];
            })->toArray(),
            'votes' => $election->votes->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'voter' => $vote->voter ? [
                        'id' => $vote->voter->id,
                        'first_name' => $vote->voter->first_name,
                        'last_name' => $vote->voter->last_name,
                        'full_name' => "{$vote->voter->first_name} {$vote->voter->last_name}",
                        'username' => $vote->voter->username,
                    ] : null,
                    'candidate' => $vote->candidate ? [
                        'id' => $vote->candidate->id,
                        'first_name' => $vote->candidate->first_name,
                        'last_name' => $vote->candidate->last_name,
                        'full_name' => "{$vote->candidate->first_name} {$vote->candidate->last_name}",
                        'username' => $vote->candidate->username,
                    ] : null,
                    'created_at' => $vote->created_at?->format('Y-m-d H:i:s'),
                ];
            })->toArray(),
            'created_at' => $election->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $election->created_at->diffForHumans(),
        ];
    }

    /**
     * Cancel an election
     */
    public function cancelElection(int $id): bool
    {
        try {
            $election = $this->repository->find($id);
            if (!$election || !$election->isActive()) {
                return false;
            }

            $success = $this->repository->cancel($id);

            if ($success) {
                $classSetName = $election->classSet?->name ?? "Class Set #{$election->class_set_id}";
                $this->logActivity('cancel_election', 'GroupElection', $id, "Cancelled {$election->type} election for {$classSetName}");
            }

            return $success;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Extend an election deadline
     */
    public function extendElection(int $id, int $hours = 24): bool
    {
        try {
            $election = $this->repository->extend($id, $hours);

            if ($election) {
                $classSetName = $election->classSet?->name ?? "Class Set #{$election->class_set_id}";
                $this->logActivity('extend_election', 'GroupElection', $id, "Extended {$election->type} election for {$classSetName} by {$hours} hours");
                return true;
            }

            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get election statistics
     */
    public function getStats(): array
    {
        return [
            'total' => $this->repository->count(),
            'active' => $this->repository->countActive(),
            'completed' => $this->repository->countCompleted(),
            'cancelled' => $this->repository->countCancelled(),
        ];
    }

    /**
     * Format election for list view
     */
    private function formatElectionForList($election): array
    {
        return [
            'id' => $election->id,
            'type' => $election->type,
            'status' => $election->status,
            'positions_to_fill' => $election->positions_to_fill,
            'is_active' => $election->isActive(),
            'has_ended' => $election->hasEnded(),
            'candidates_count' => $election->candidates_count,
            'votes_count' => $election->votes_count,
            'started_at' => $election->started_at?->format('Y-m-d H:i:s'),
            'ends_at' => $election->ends_at?->format('Y-m-d H:i:s'),
            'ends_at_formatted' => $election->ends_at?->diffForHumans() ?? 'N/A',
            'class_set' => $election->classSet ? [
                'id' => $election->classSet->id,
                'name' => $election->classSet->name,
                'year' => $election->classSet->year,
                'department' => $election->classSet->department ? [
                    'id' => $election->classSet->department->id,
                    'name' => $election->classSet->department->name,
                ] : null,
            ] : null,
            'created_at' => $election->created_at->format('Y-m-d'),
            'created_at_formatted' => $election->created_at->diffForHumans(),
        ];
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail
        }
    }
}
