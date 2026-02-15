<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ActivityLogController extends Controller
{
    use AuthorizesOrgActions;

    public function __construct(
        private OrgActivityLogService $activityLogService,
    ) {}

    public function index(Request $request)
    {
        $this->authorizeOrg('view-analytics');
        $orgAccount = Auth::guard('org')->user();

        $filters = $request->only(['search', 'action_type', 'account_id', 'date_from', 'date_to']);

        $logs = $this->activityLogService->getActivityLogs($orgAccount->organization_id, $filters);
        $filterOptions = $this->activityLogService->getFilterOptions($orgAccount->organization_id);

        return Inertia::render('OrgPages/ActivityLogs/Index', [
            'logs' => $logs,
            'filters' => $filters,
            'filterOptions' => $filterOptions,
        ]);
    }
}
