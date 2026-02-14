<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\GroupElection;
use Illuminate\Pagination\LengthAwarePaginator;

class ElectionRepository
{
    /**
     * Get all elections with pagination
     */
    public function getAllPaginated(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = GroupElection::with([
            'classSet:id,uuid,name,year',
            'classSet.department:id,name',
        ])
        ->withCount(['candidates', 'votes']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->whereHas('classSet', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('department', function ($dq) use ($search) {
                        $dq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find an election by ID with relationships
     */
    public function find(int $id): ?GroupElection
    {
        return GroupElection::with([
            'classSet:id,uuid,name,year',
            'classSet.department:id,name',
            'candidates.user:id,first_name,last_name,username,email,profile_image',
            'votes.voter:id,first_name,last_name,username',
            'votes.candidate:id,first_name,last_name,username',
            'parentElection:id,type,status',
        ])
        ->withCount(['candidates', 'votes'])
        ->find($id);
    }

    /**
     * Cancel an election
     */
    public function cancel(int $id): bool
    {
        $election = GroupElection::find($id);
        if ($election && $election->isActive()) {
            $election->update(['status' => 'cancelled']);
            return true;
        }
        return false;
    }

    /**
     * Extend an election deadline
     */
    public function extend(int $id, int $hours): ?GroupElection
    {
        $election = GroupElection::find($id);
        if ($election && $election->isActive()) {
            $election->update([
                'ends_at' => $election->ends_at->addHours($hours),
            ]);
            return $election->fresh();
        }
        return null;
    }

    /**
     * Count total elections
     */
    public function count(): int
    {
        return GroupElection::count();
    }

    /**
     * Count active elections
     */
    public function countActive(): int
    {
        return GroupElection::where('status', 'active')->count();
    }

    /**
     * Count completed elections
     */
    public function countCompleted(): int
    {
        return GroupElection::where('status', 'completed')->count();
    }

    /**
     * Count cancelled elections
     */
    public function countCancelled(): int
    {
        return GroupElection::where('status', 'cancelled')->count();
    }
}
