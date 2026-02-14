<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\SecurityService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityController extends Controller
{
    public function __construct(
        private SecurityService $securityService
    ) {
    }

    /**
     * Display security dashboard
     */
    public function dashboard()
    {
        $data = $this->securityService->getDashboardData();

        return Inertia::render('AdminPages/Security/Dashboard', [
            'dashboardData' => $data,
        ]);
    }

    /**
     * Display audit log
     */
    public function auditLog(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        $data = $this->securityService->getAuditLog($perPage, $page, $filters);

        return Inertia::render('AdminPages/Security/AuditLog', [
            'logs' => $data['logs'],
            'actionTypes' => $data['actionTypes'],
            'resourceTypes' => $data['resourceTypes'],
            'filters' => $filters,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Force logout a user
     */
    public function forceLogout(int $userId)
    {
        $success = $this->securityService->forceLogoutUser($userId);

        if ($success) {
            return redirect()->back()->with('success', 'User has been forcefully logged out');
        }

        return redirect()->back()->with('error', 'Failed to force logout user');
    }

    /**
     * Display data privacy management
     */
    public function dataPrivacy()
    {
        return Inertia::render('AdminPages/Security/DataPrivacy');
    }

    /**
     * Export user data
     */
    public function dataExport(int $userId)
    {
        $data = $this->securityService->exportUserData($userId);

        if ($data) {
            return response()->json($data);
        }

        return redirect()->back()->with('error', 'Failed to export user data');
    }

    /**
     * Anonymize user data
     */
    public function anonymize(int $userId)
    {
        $success = $this->securityService->anonymizeUser($userId);

        if ($success) {
            return redirect()->back()->with('success', 'User data anonymized successfully');
        }

        return redirect()->back()->with('error', 'Failed to anonymize user data');
    }
}
