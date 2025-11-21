<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\User;
use App\Repositories\GuestRepositories\UserReportRepository;

class UserReportService
{
    public function __construct(
        private UserReportRepository $reportRepository,
    ) {}

    /**
     * Submit a report about a user
     */
    public function submitReport(User $reporter, string $username, array $data): array
    {
        // Find the user to report
        $reportedUser = User::where('username', $username)->firstOrFail();

        // Cannot report yourself
        if ($reporter->id === $reportedUser->id) {
            throw new \Exception('You cannot report yourself.');
        }

        // Check if already reported
        if ($this->reportRepository->hasReported($reporter->id, $reportedUser->id)) {
            throw new \Exception('You have already reported this user.');
        }

        // Create the report
        $report = $this->reportRepository->create($reporter->id, $reportedUser->id, [
            'reason' => $data['reason'],
            'description' => $data['description'] ?? null,
        ]);

        return [
            'success' => true,
            'message' => 'Report submitted successfully. Our team will review it shortly.',
            'report_id' => $report->id,
        ];
    }

    /**
     * Get all reports submitted by a user
     */
    public function getUserReports(User $user): array
    {
        $reports = $this->reportRepository->getReportsByUser($user->id);

        return $reports->map(fn($report) => [
            'id' => $report->id,
            'reported_user' => [
                'id' => $report->reportedUser->id,
                'username' => $report->reportedUser->username,
                'first_name' => $report->reportedUser->first_name,
                'last_name' => $report->reportedUser->last_name,
            ],
            'reason' => $report->reason,
            'description' => $report->description,
            'status' => $report->status,
            'created_at' => $report->created_at,
        ])->toArray();
    }

    /**
     * Validate report submission data
     */
    public function validateReportData(array $data): array
    {
        $errors = [];

        if (empty($data['username'])) {
            $errors['username'] = 'Username is required.';
        }

        if (empty($data['reason'])) {
            $errors['reason'] = 'Reason is required.';
        } elseif (!in_array($data['reason'], ['harassment', 'spam', 'inappropriate', 'impersonation', 'other'])) {
            $errors['reason'] = 'Invalid reason selected.';
        }

        if (isset($data['description']) && strlen($data['description']) > 1000) {
            $errors['description'] = 'Description cannot exceed 1000 characters.';
        }

        return $errors;
    }
}
