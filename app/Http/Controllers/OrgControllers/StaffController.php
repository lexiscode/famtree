<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgStaffService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class StaffController extends Controller
{
    public function __construct(
        private OrgStaffService $staffService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Staff/Index', [
            'staff' => $this->staffService->getStaff($orgAccount->organization_id),
        ]);
    }

    public function store(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$orgAccount->isOwner() && !$orgAccount->hasPermission('manage_staff')) {
            return redirect()->back()->with('error', 'You do not have permission to manage staff.');
        }

        $validated = $request->validate([
            'username' => 'required|string|unique:org_accounts,username|max:100',
            'email' => 'nullable|email|unique:org_accounts,email|max:255',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,editor,moderator',
            'display_name' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
        ]);

        $this->staffService->createStaff($orgAccount->organization_id, $validated);

        return redirect()->back()->with('success', 'Staff account created successfully.');
    }

    public function update(Request $request, int $id)
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$orgAccount->isOwner() && !$orgAccount->hasPermission('manage_staff')) {
            return redirect()->back()->with('error', 'You do not have permission to manage staff.');
        }

        $validated = $request->validate([
            'role' => 'sometimes|in:admin,editor,moderator',
            'display_name' => 'nullable|string|max:255',
            'permissions' => 'nullable|array',
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
        $orgAccount = Auth::guard('org')->user();

        if (!$orgAccount->isOwner() && !$orgAccount->hasPermission('manage_staff')) {
            return redirect()->back()->with('error', 'You do not have permission to manage staff.');
        }

        if (!$this->staffService->deleteStaff($id, $orgAccount->organization_id)) {
            return redirect()->back()->with('error', 'Staff account not found or cannot be deleted.');
        }

        return redirect()->back()->with('success', 'Staff account removed successfully.');
    }
}
