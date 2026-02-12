<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgStaffService;
use App\Actions\OrgServices\OrgRoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
    use AuthorizesOrgActions;

    public function __construct(
        private OrgStaffService $staffService,
        private OrgRoleService $roleService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Staff/Index', [
            'staff' => $this->staffService->getStaff($orgAccount->organization_id),
            'roles' => $this->roleService->getNonSystemRoles($orgAccount->organization_id),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'username' => 'required|string|unique:org_accounts,username|max:100',
            'email' => 'nullable|email|unique:org_accounts,email|max:255',
            'password' => 'required|string|min:8',
            'org_role_id' => 'required|exists:org_roles,id',
            'display_name' => 'nullable|string|max:255',
        ]);

        $this->staffService->createStaff($orgAccount->organization_id, $validated);

        return redirect()->back()->with('success', 'Staff account created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'org_role_id' => 'sometimes|exists:org_roles,id',
            'display_name' => 'nullable|string|max:255',
            'is_active' => 'sometimes|boolean',
            'password' => 'nullable|string|min:8',
        ]);

        $staff = $this->staffService->updateStaff($id, $orgAccount->organization_id, $validated);

        if (!$staff) {
            return redirect()->back()->with('error', 'Staff account not found or cannot be modified.');
        }

        return redirect()->back()->with('success', 'Staff account updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        if (!$this->staffService->deleteStaff($id, $orgAccount->organization_id)) {
            return redirect()->back()->with('error', 'Staff account not found or cannot be deleted.');
        }

        return redirect()->back()->with('success', 'Staff account removed successfully.');
    }
}
