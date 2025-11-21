<?php

namespace App\Repositories\GuestRepositories;

use App\Models\UserReport;

class UserReportRepository
{
    /**
     * Create a new user report
     */
    public function create(int $reporterId, int $reportedUserId, array $data): UserReport
    {
        return UserReport::create([
            'reporter_user_id' => $reporterId,
            'reported_user_id' => $reportedUserId,
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
            'status' => 'pending',
        ]);
    }

    /**
     * Check if user has already reported another user
     */
    public function hasReported(int $reporterId, int $reportedUserId): bool
    {
        return UserReport::where('reporter_user_id', $reporterId)
            ->where('reported_user_id', $reportedUserId)
            ->exists();
    }

    /**
     * Get all reports by a user
     */
    public function getReportsByUser(int $userId)
    {
        return UserReport::where('reporter_user_id', $userId)
            ->with(['reportedUser', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get all reports about a user
     */
    public function getReportsAboutUser(int $userId)
    {
        return UserReport::where('reported_user_id', $userId)
            ->with(['reporter', 'reviewer'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Find report by ID
     */
    public function find(int $reportId): ?UserReport
    {
        return UserReport::find($reportId);
    }

    /**
     * Get all pending reports
     */
    public function getPendingReports()
    {
        return UserReport::where('status', 'pending')
            ->with(['reporter', 'reportedUser'])
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Update report status
     */
    public function updateStatus(int $reportId, string $status, string $notes = null, int $reviewerId = null)
    {
        $report = UserReport::findOrFail($reportId);
        $report->update([
            'status' => $status,
            'admin_notes' => $notes,
            'reviewed_by_admin_id' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        return $report;
    }

    /**
     * Count pending reports
     */
    public function getPendingReportsCount(): int
    {
        return UserReport::where('status', 'pending')->count();
    }

    /**
     * Count reports about a specific user
     */
    public function getReportsCountAboutUser(int $userId): int
    {
        return UserReport::where('reported_user_id', $userId)->count();
    }
}
