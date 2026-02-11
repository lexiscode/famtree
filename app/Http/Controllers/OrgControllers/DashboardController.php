<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgDashboardService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        private OrgDashboardService $dashboardService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();
        $organizationId = $orgAccount->organization_id;

        return Inertia::render('OrgPages/Dashboard/Index', [
            'stats' => $this->dashboardService->getStats($organizationId),
            'recentActivity' => $this->dashboardService->getRecentActivity($organizationId),
        ]);
    }
}
