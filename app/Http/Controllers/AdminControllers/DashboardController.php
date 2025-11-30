<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Actions\AdminServices\DashboardService;

class DashboardController extends Controller
{
    /**
     * Create a new controller instance.
     */
    public function __construct(private DashboardService $dashboardService)
    {
    }

    /**
     * Show the admin dashboard
     */
    public function index()
    {
        return Inertia::render('AdminPages/Dashboard/Index', [
            'metrics' => $this->dashboardService->getKeyMetrics(),
            'userGrowth' => $this->dashboardService->getUserGrowthData(30),
            'connectionStats' => $this->dashboardService->getConnectionStats(),
            'reportStats' => $this->dashboardService->getReportStats(),
            'recentActivity' => $this->dashboardService->getRecentActivity(10),
            'alerts' => $this->dashboardService->getActiveAlerts(),
        ]);
    }
}
