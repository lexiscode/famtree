<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\OrganizationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function __construct(private OrganizationService $organizationService)
    {
    }

    /**
     * Display all organizations
     */
    public function index()
    {
        $organizations = $this->organizationService->getAllOrganizations();

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Index', [
            'organizations' => $organizations,
        ]);
    }

    /**
     * Display organization profile page
     */
    public function showOrganization(string $slug)
    {
        $data = $this->organizationService->getOrganization($slug);

        if (!$data) {
            return redirect()->route('organizations.index')
                ->with('error', 'Organization not found.');
        }

        $breadcrumb = $this->organizationService->getBreadcrumbData('organization', $slug);

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Organization/Show', [
            'organization' => $data['organization'],
            'facultiesCount' => $data['faculties_count'],
            'galleries' => $data['galleries'],
            'breadcrumb' => $breadcrumb,
        ]);
    }

    /**
     * Display faculties for an organization
     */
    public function faculties(string $organizationSlug)
    {
        $data = $this->organizationService->getFaculties($organizationSlug);

        if (!$data) {
            return redirect()->route('organizations.index')
                ->with('error', 'Organization not found.');
        }

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Faculties/Index', [
            'organization' => $data['organization'],
            'faculties' => $data['faculties'],
        ]);
    }

    /**
     * Display departments for a faculty
     */
    public function departments(string $facultySlug)
    {
        $data = $this->organizationService->getDepartments($facultySlug);

        if (!$data) {
            return redirect()->route('organizations.index')
                ->with('error', 'Faculty not found.');
        }

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Departments/Index', [
            'faculty' => $data['faculty'],
            'organization' => $data['organization'],
            'departments' => $data['departments'],
        ]);
    }

    /**
     * Display class sets for a department
     */
    public function classSets(Request $request, string $departmentSlug)
    {
        $userId = $request->user()->id;
        $data = $this->organizationService->getClassSets($departmentSlug, $userId);

        if (!$data) {
            return redirect()->route('organizations.index')
                ->with('error', 'Department not found.');
        }

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/ClassSets/Index', [
            'department' => $data['department'],
            'faculty' => $data['faculty'],
            'organization' => $data['organization'],
            'classSets' => $data['classSets'],
        ]);
    }

    /**
     * Display channels for a football club (direct class sets without faculty/department navigation)
     */
    public function channels(Request $request, string $organizationSlug)
    {
        $userId = $request->user()->id;
        $data = $this->organizationService->getChannels($organizationSlug, $userId);

        if (!$data) {
            return redirect()->route('organizations.index')
                ->with('error', 'Organization not found.');
        }

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Channels/Index', [
            'organization' => $data['organization'],
            'channels' => $data['channels'],
        ]);
    }
}
