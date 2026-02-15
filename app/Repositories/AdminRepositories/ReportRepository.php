<?php
namespace App\Repositories\AdminRepositories;

use App\Models\UserReport;
use App\Models\UserBlock;
use Illuminate\Pagination\LengthAwarePaginator;

class ReportRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return UserReport::with([
            'reporter:id,first_name,last_name,username,profile_image',
            'reportedUser:id,first_name,last_name,username,profile_image'
        ])
            ->orderByRaw("CASE WHEN status = 'pending' THEN 0 WHEN status = 'reviewing' THEN 1 ELSE 2 END")
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function filterByCriteria(array $filters, int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        $query = UserReport::with([
            'reporter:id,first_name,last_name,username,profile_image',
            'reportedUser:id,first_name,last_name,username,profile_image'
        ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('reason', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhereHas('reporter', fn($rq) => $rq->where('username', 'like', "%{$search}%"))
                    ->orWhereHas('reportedUser', fn($rq) => $rq->where('username', 'like', "%{$search}%"));
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['reason'])) {
            $query->where('reason', $filters['reason']);
        }

        $query->orderBy($filters['sortBy'] ?? 'created_at', $filters['sortOrder'] ?? 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?UserReport
    {
        return UserReport::with([
            'reporter:id,first_name,last_name,username,email,profile_image',
            'reportedUser:id,first_name,last_name,username,email,profile_image,account_status'
        ])->find($id);
    }

    public function update(int $id, array $data): ?UserReport
    {
        $report = UserReport::find($id);
        if ($report) { $report->update($data); }
        return $report;
    }

    public function count(): int { return UserReport::count(); }
    public function countByStatus(string $status): int { return UserReport::where('status', $status)->count(); }

    // Blocks
    public function getAllBlocksPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return UserBlock::with([
            'blocker:id,first_name,last_name,username',
            'blockedUser:id,first_name,last_name,username'
        ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function deleteBlock(int $id): bool
    {
        $block = UserBlock::find($id);
        return $block ? $block->delete() : false;
    }

    public function countBlocks(): int { return UserBlock::count(); }
}
