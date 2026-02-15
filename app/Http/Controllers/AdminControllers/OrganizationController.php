<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\OrganizationService;
use App\Repositories\AdminRepositories\OrgCategoryRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function __construct(
        private OrganizationService $orgService,
        private OrgCategoryRepository $categoryRepo
    ) {
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        $hasActiveFilters = !empty($filters) || !empty($search);

        if ($search) {
            $organizations = $this->orgService->searchOrgs($search, $perPage, $page);
        } elseif ($hasActiveFilters) {
            $filters['search'] = $search;
            $organizations = $this->orgService->getFilteredOrgs($filters, $perPage, $page);
        } else {
            $organizations = $this->orgService->getAllOrgs($perPage, $page);
        }

        $statistics = $this->orgService->getOrgStats();
        $categories = $this->categoryRepo->getAll()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);

        return Inertia::render('AdminPages/Organizations/Index', [
            'organizations' => $organizations,
            'statistics' => $statistics,
            'categories' => $categories,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    public function show(int $id)
    {
        $org = $this->orgService->getOrgDetails($id);

        if (!$org) {
            return redirect()->route('admin.organizations.index')->with('error', 'Organization not found');
        }

        return Inertia::render('AdminPages/Organizations/Show', [
            'organization' => $org,
        ]);
    }

    public function create()
    {
        $categories = $this->categoryRepo->getAll()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);

        return Inertia::render('AdminPages/Organizations/Create', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'category_id' => 'nullable|integer|exists:organization_categories,id',
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'leader_name' => 'nullable|string|max:255',
            'leader_title' => 'nullable|string|max:255',
        ]);

        $org = $this->orgService->createOrg($data);

        if ($org) {
            return redirect()->route('admin.organizations.show', $org->id)->with('success', 'Organization created successfully');
        }

        return redirect()->back()->with('error', 'Failed to create organization')->withInput();
    }

    public function edit(int $id)
    {
        $org = $this->orgService->getOrgDetails($id);

        if (!$org) {
            return redirect()->route('admin.organizations.index')->with('error', 'Organization not found');
        }

        $categories = $this->categoryRepo->getAll()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);

        return Inertia::render('AdminPages/Organizations/Edit', [
            'organization' => $org,
            'categories' => $categories,
        ]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'short_name' => 'nullable|string|max:50',
            'category_id' => 'nullable|integer|exists:organization_categories,id',
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|url|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'founded_year' => 'nullable|integer|min:1800|max:' . date('Y'),
            'leader_name' => 'nullable|string|max:255',
            'leader_title' => 'nullable|string|max:255',
        ]);

        $success = $this->orgService->updateOrg($id, $data);

        if ($success) {
            return redirect()->route('admin.organizations.show', $id)->with('success', 'Organization updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update organization');
    }

    public function suspend(int $id)
    {
        $success = $this->orgService->suspendOrg($id);

        if ($success) {
            return redirect()->back()->with('success', 'Organization suspended successfully');
        }

        return redirect()->back()->with('error', 'Failed to suspend organization');
    }

    public function unsuspend(int $id)
    {
        $success = $this->orgService->unsuspendOrg($id);

        if ($success) {
            return redirect()->back()->with('success', 'Organization reactivated successfully');
        }

        return redirect()->back()->with('error', 'Failed to reactivate organization');
    }

    public function destroy(int $id)
    {
        $success = $this->orgService->deleteOrg($id);

        if ($success) {
            return redirect()->route('admin.organizations.index')->with('success', 'Organization deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete organization');
    }

    public function createStaff(Request $request, int $id)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8',
            'display_name' => 'nullable|string|max:255',
            'org_role_id' => 'nullable|integer',
        ]);

        $success = $this->orgService->createStaffAccount($id, $data);

        if ($success) {
            return redirect()->back()->with('success', 'Staff account created successfully');
        }

        return redirect()->back()->with('error', 'Failed to create staff account');
    }

    public function disableStaff(int $id)
    {
        $success = $this->orgService->disableStaffAccount($id);

        if ($success) {
            return redirect()->back()->with('success', 'Staff account disabled successfully');
        }

        return redirect()->back()->with('error', 'Failed to disable staff account');
    }

    public function resetStaffPassword(int $id)
    {
        $success = $this->orgService->resetStaffPassword($id);

        if ($success) {
            return redirect()->back()->with('success', 'Staff password reset successfully');
        }

        return redirect()->back()->with('error', 'Failed to reset staff password');
    }
}
