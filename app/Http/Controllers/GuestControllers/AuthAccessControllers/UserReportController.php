<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\ReportUserRequest;
use App\Actions\GuestServices\AuthAccessServices\UserReportService;
use Illuminate\Http\JsonResponse;

class UserReportController extends Controller
{
    public function __construct(
        private UserReportService $reportService,
    ) {}

    /**
     * Submit a report about a user
     */
    public function store(ReportUserRequest $request): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $validated = $request->validated();

            $result = $this->reportService->submitReport(
                $user,
                $validated['username'],
                [
                    'reason' => $validated['reason'],
                    'description' => $validated['description'] ?? null,
                ]
            );

            return response()->json($result, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get user's submitted reports
     */
    public function myReports(): JsonResponse
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        try {
            $reports = $this->reportService->getUserReports($user);

            return response()->json([
                'success' => true,
                'reports' => $reports,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }
}
