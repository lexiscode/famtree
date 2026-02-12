<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgRoleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RoleController extends Controller
{
    use AuthorizesOrgActions;

    public function __construct(
        private OrgRoleService $roleService,
    ) {}

    public function index()
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Roles/Index', [
            'roles' => $this->roleService->getRoles($orgAccount->organization_id),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'permissions' => 'nullable|array',
        ]);

        $this->roleService->createRole($orgAccount->organization_id, $validated);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'permissions' => 'nullable|array',
        ]);

        $role = $this->roleService->updateRole($id, $orgAccount->organization_id, $validated);

        if (!$role) {
            return redirect()->back()->with('error', 'Role not found or cannot be modified.');
        }

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    public function destroy(int $id)
    {
        $this->authorizeOrg('manage-staff');
        $orgAccount = Auth::guard('org')->user();

        $result = $this->roleService->deleteRole($id, $orgAccount->organization_id);

        if ($result !== true) {
            return redirect()->back()->with('error', $result);
        }

        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
