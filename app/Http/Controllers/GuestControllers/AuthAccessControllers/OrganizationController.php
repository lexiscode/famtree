<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\OrganizationService;
use App\Actions\GuestServices\OrganizationFollowService;
use App\Repositories\OrgRepositories\OrgGroupRepository;
use App\Models\GuestModels\Organization;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationController extends Controller
{
    public function __construct(
        private OrganizationService $organizationService,
        private OrganizationFollowService $followService,
        private OrgGroupRepository $orgGroupRepository,
    ) {
    }

    /**
     * Display all organizations
     */
    public function index(Request $request)
    {
        $organizations = $this->organizationService->getAllOrganizations();
        $followedIds = $this->followService->getFollowedOrganizationIds($request->user()->id);

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Index', [
            'organizations' => $organizations,
            'followedIds' => $followedIds,
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

        // Get org groups available for joining
        $userId = auth()->id();
        $org = Organization::where('slug', $slug)->first();
        $orgGroups = $org ? $this->orgGroupRepository->getJoinableGroups($org->id, $userId) : collect();

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Organization/Show', [
            'organization' => $data['organization'],
            'facultiesCount' => $data['faculties_count'],
            'galleries' => $data['galleries'],
            'breadcrumb' => $breadcrumb,
            'orgGroups' => $orgGroups,
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
     * Request to join an org group.
     */
    public function requestJoinGroup(Request $request, int $groupId)
    {
        $user = auth()->user();

        $group = $this->orgGroupRepository->findById($groupId);
        if (!$group || !$group->allow_join_requests || $group->is_suspended) {
            return redirect()->back()->with('error', 'Cannot join this group.');
        }

        // Check if already a member
        $member = $this->orgGroupRepository->getMember($groupId, $user->id);
        if ($member && $member->is_active) {
            return redirect()->back()->with('error', 'You are already a member.');
        }

        // Check if already has pending request
        if ($this->orgGroupRepository->hasPendingRequest($groupId, $user->id)) {
            return redirect()->back()->with('error', 'You already have a pending request.');
        }

        // Check if banned
        $isBanned = \App\Models\OrgModels\OrgGroupBan::where('org_group_id', $groupId)
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })->exists();

        if ($isBanned) {
            return redirect()->back()->with('error', 'You are banned from this group.');
        }

        $this->orgGroupRepository->createJoinRequest([
            'org_group_id' => $groupId,
            'user_id' => $user->id,
            'message' => $request->input('message'),
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Join request sent!');
    }

    /**
     * Cancel a pending join request.
     */
    public function cancelJoinRequest(int $requestId)
    {
        $user = auth()->user();
        $result = $this->orgGroupRepository->cancelJoinRequest($requestId, $user->id);

        if (!$result) {
            return redirect()->back()->with('error', 'Request not found.');
        }

        return redirect()->back()->with('success', 'Join request cancelled.');
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
