<?php
namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\ReportRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class ReportService
{
    public function __construct(private ReportRepository $repository) {}

    public function getAllReports(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page)->through(fn($r) => $this->formatReport($r));
    }

    public function getFilteredReports(array $filters, int $perPage = 15, int $page = 1)
    {
        return $this->repository->filterByCriteria($filters, $perPage, $page)->through(fn($r) => $this->formatReport($r));
    }

    public function getReportDetails(int $id): ?array
    {
        $report = $this->repository->find($id);
        if (!$report) return null;

        return [
            'id' => $report->id,
            'reason' => $report->reason,
            'description' => $report->description,
            'status' => $report->status,
            'admin_notes' => $report->admin_notes,
            'reviewed_at' => $report->reviewed_at?->format('Y-m-d H:i:s'),
            'reporter' => $report->reporter ? [
                'id' => $report->reporter->id,
                'full_name' => "{$report->reporter->first_name} {$report->reporter->last_name}",
                'username' => $report->reporter->username,
                'email' => $report->reporter->email,
                'profile_image_url' => $report->reporter->profile_image_url,
            ] : null,
            'reported_user' => $report->reportedUser ? [
                'id' => $report->reportedUser->id,
                'full_name' => "{$report->reportedUser->first_name} {$report->reportedUser->last_name}",
                'username' => $report->reportedUser->username,
                'email' => $report->reportedUser->email,
                'profile_image_url' => $report->reportedUser->profile_image_url,
                'account_status' => $report->reportedUser->account_status,
            ] : null,
            'created_at' => $report->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function reviewReport(int $id): bool
    {
        try {
            $report = $this->repository->update($id, ['status' => 'reviewing']);
            if ($report) {
                $this->logActivity('review_report', 'UserReport', $id, "Started reviewing report #{$id}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function resolveReport(int $id, string $notes = ''): bool
    {
        try {
            $adminId = Auth::guard('admin')->id();
            $report = $this->repository->update($id, [
                'status' => 'resolved',
                'admin_notes' => $notes,
                'reviewed_at' => now(),
                'reviewed_by_admin_id' => $adminId,
            ]);
            if ($report) {
                $this->logActivity('resolve_report', 'UserReport', $id, "Resolved report #{$id}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function dismissReport(int $id, string $notes = ''): bool
    {
        try {
            $adminId = Auth::guard('admin')->id();
            $report = $this->repository->update($id, [
                'status' => 'dismissed',
                'admin_notes' => $notes,
                'reviewed_at' => now(),
                'reviewed_by_admin_id' => $adminId,
            ]);
            if ($report) {
                $this->logActivity('dismiss_report', 'UserReport', $id, "Dismissed report #{$id}");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function getReportStats(): array
    {
        return [
            'total' => $this->repository->count(),
            'pending' => $this->repository->countByStatus('pending'),
            'reviewing' => $this->repository->countByStatus('reviewing'),
            'resolved' => $this->repository->countByStatus('resolved'),
            'dismissed' => $this->repository->countByStatus('dismissed'),
            'total_blocks' => $this->repository->countBlocks(),
        ];
    }

    public function getAllBlocks(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllBlocksPaginated($perPage, $page)->through(fn($b) => [
            'id' => $b->id,
            'blocker' => $b->blocker ? ['id' => $b->blocker->id, 'full_name' => "{$b->blocker->first_name} {$b->blocker->last_name}", 'username' => $b->blocker->username] : null,
            'blocked_user' => $b->blockedUser ? ['id' => $b->blockedUser->id, 'full_name' => "{$b->blockedUser->first_name} {$b->blockedUser->last_name}", 'username' => $b->blockedUser->username] : null,
            'created_at' => $b->created_at->format('Y-m-d H:i:s'),
        ]);
    }

    public function removeBlock(int $id): bool
    {
        try {
            $this->logActivity('remove_block', 'UserBlock', $id, "Removed block #{$id}");
            return $this->repository->deleteBlock($id);
        } catch (\Exception $e) { return false; }
    }

    private function formatReport($report): array
    {
        return [
            'id' => $report->id,
            'reason' => $report->reason,
            'description' => \Illuminate\Support\Str::limit($report->description, 100),
            'status' => $report->status,
            'reporter' => $report->reporter ? ['id' => $report->reporter->id, 'full_name' => "{$report->reporter->first_name} {$report->reporter->last_name}", 'username' => $report->reporter->username, 'profile_image_url' => $report->reporter->profile_image_url] : null,
            'reported_user' => $report->reportedUser ? ['id' => $report->reportedUser->id, 'full_name' => "{$report->reportedUser->first_name} {$report->reportedUser->last_name}", 'username' => $report->reportedUser->username, 'profile_image_url' => $report->reportedUser->profile_image_url] : null,
            'created_at' => $report->created_at->format('Y-m-d'),
            'created_at_formatted' => $report->created_at->diffForHumans(),
        ];
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {}
    }
}
