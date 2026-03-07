<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgBroadcastService;
use App\Repositories\OrgRepositories\OrgActivityLogRepository;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\ClassSet;
use App\Models\OrgModels\OrgBroadcast;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    use AuthorizesOrgActions;
    public function __construct(
        private OrgBroadcastService $broadcastService,
        private OrgActivityLogRepository $activityLogRepo,
    ) {}

    /**
     * Check if the current org account can access broadcasts
     * (either full manage-broadcasts or limited manage-group-broadcasts).
     */
    private function canAccessBroadcasts(): bool
    {
        return Gate::allows('manage-broadcasts') || Gate::allows('manage-group-broadcasts');
    }

    private function hasFullBroadcastAccess(): bool
    {
        return Gate::allows('manage-broadcasts');
    }

    /**
     * Get the year limit for the current org account.
     * Returns null if unlimited (full broadcast access).
     */
    private function getYearLimit(): ?int
    {
        $orgAccount = Auth::guard('org')->user();

        // Full broadcast access = no year limit
        if ($orgAccount->hasPermission('manage_broadcasts')) {
            return null;
        }

        return $orgAccount->orgRole?->broadcast_year_limit;
    }

    /**
     * Get class sets filtered by year limit.
     */
    private function getFilteredGroups(int $organizationId, ?int $yearLimit): array
    {
        $org = Organization::with('faculties.departments.classSets')->find($organizationId);
        $groups = [];

        if (!$org) return $groups;

        $minYear = $yearLimit ? (string)(date('Y') - $yearLimit) : null;

        foreach ($org->faculties as $faculty) {
            foreach ($faculty->departments as $dept) {
                foreach ($dept->classSets as $classSet) {
                    // Apply year filter if limited
                    if ($minYear && $classSet->year && $classSet->year < $minYear) {
                        continue;
                    }

                    $groups[] = [
                        'id' => $classSet->id,
                        'name' => $classSet->name,
                        'year' => $classSet->year,
                        'faculty' => $faculty->name,
                        'department' => $dept->name,
                    ];
                }
            }
        }

        return $groups;
    }

    public function index(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $filters = $request->only(['category', 'status', 'priority', 'approval_status', 'is_flagged']);
        $isLimitedAccess = !$orgAccount->hasPermission('manage_broadcasts');

        return Inertia::render('OrgPages/Broadcasts/Index', [
            'broadcasts' => $this->broadcastService->getBroadcasts($orgAccount->organization_id, 15, $filters),
            'isLimitedAccess' => $isLimitedAccess,
            'pendingApprovalCount' => $isLimitedAccess ? 0 : $this->broadcastService->getPendingApprovalCount($orgAccount->organization_id),
            'categories' => OrgBroadcast::CATEGORIES,
            'priorities' => OrgBroadcast::PRIORITIES,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $yearLimit = $this->getYearLimit();
        $groups = $this->getFilteredGroups($orgAccount->organization_id, $yearLimit);
        $isLimitedAccess = !$orgAccount->hasPermission('manage_broadcasts');

        return Inertia::render('OrgPages/Broadcasts/Create', [
            'groups' => $groups,
            'yearLimit' => $yearLimit,
            'isLimitedAccess' => $isLimitedAccess,
            'categories' => OrgBroadcast::CATEGORIES,
            'priorities' => OrgBroadcast::PRIORITIES,
        ]);
    }

    public function store(Request $request)
    {
        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $isLimitedAccess = !$orgAccount->hasPermission('manage_broadcasts');

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'required|in:announcement,event,urgent,reminder,academic,general',
            'priority' => 'required|in:normal,high,critical',
            'message' => 'required|string',
            'target_type' => 'required|in:all_groups,selected_groups',
            'target_class_set_ids' => 'nullable|array',
            'target_class_set_ids.*' => 'integer|exists:class_sets,id',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'scheduled_at' => 'required_if:schedule_type,scheduled|required_if:schedule_type,recurring|nullable|date|after:now',
            'recurrence_type' => 'nullable|in:daily,weekly,monthly',
            'recurrence_count' => 'nullable|integer|min:1',
        ]);

        // Enforce year limit for group broadcast users
        $yearLimit = $this->getYearLimit();
        if ($yearLimit !== null && $validated['target_type'] === 'selected_groups' && !empty($validated['target_class_set_ids'])) {
            $allowedGroups = $this->getFilteredGroups($orgAccount->organization_id, $yearLimit);
            $allowedIds = array_column($allowedGroups, 'id');
            $invalidIds = array_diff($validated['target_class_set_ids'], $allowedIds);
            if (!empty($invalidIds)) {
                return redirect()->back()->with('error', 'Some selected groups are outside your allowed year range.');
            }
        }

        // Group broadcast users cannot send to all_groups
        if ($yearLimit !== null && $validated['target_type'] === 'all_groups') {
            return redirect()->back()->with('error', 'You can only send to selected groups within your allowed year range.');
        }

        // Limited access users require approval
        $validated['requires_approval'] = $isLimitedAccess;

        $this->broadcastService->createBroadcast([
            'organization_id' => $orgAccount->organization_id,
            'org_account_id' => $orgAccount->id,
            ...$validated,
        ]);

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_created',
            'resource_type' => 'broadcast',
            'description' => 'Created a new broadcast' . ($validated['title'] ? ': ' . $validated['title'] : ''),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $message = $isLimitedAccess
            ? 'Broadcast submitted for approval.'
            : 'Broadcast created successfully.';

        return redirect()->route('org.broadcasts.index')->with('success', $message);
    }

    public function show(int $id)
    {
        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $broadcast = $this->broadcastService->getBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast) {
            return redirect()->route('org.broadcasts.index')->with('error', 'Broadcast not found.');
        }

        $broadcastData = $this->formatBroadcast($broadcast);

        return Inertia::render('OrgPages/Broadcasts/Show', [
            'broadcast' => $broadcastData,
            'hasFullAccess' => $this->hasFullBroadcastAccess(),
            'categories' => OrgBroadcast::CATEGORIES,
        ]);
    }

    public function edit(int $id)
    {
        $orgAccount = Auth::guard('org')->user();

        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $broadcast = $this->broadcastService->getBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast || in_array($broadcast->status, ['sent', 'cancelled'])) {
            return redirect()->route('org.broadcasts.index')->with('error', 'This broadcast cannot be edited.');
        }

        $yearLimit = $this->getYearLimit();
        $groups = $this->getFilteredGroups($orgAccount->organization_id, $yearLimit);

        return Inertia::render('OrgPages/Broadcasts/Edit', [
            'broadcast' => $broadcast,
            'groups' => $groups,
            'yearLimit' => $yearLimit,
            'isLimitedAccess' => !$orgAccount->hasPermission('manage_broadcasts'),
            'categories' => OrgBroadcast::CATEGORIES,
            'priorities' => OrgBroadcast::PRIORITIES,
        ]);
    }

    public function update(Request $request, int $id)
    {
        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'category' => 'sometimes|required|in:announcement,event,urgent,reminder,academic,general',
            'priority' => 'sometimes|required|in:normal,high,critical',
            'message' => 'required|string',
            'target_type' => 'required|in:all_groups,selected_groups',
            'target_class_set_ids' => 'nullable|array',
            'target_class_set_ids.*' => 'integer|exists:class_sets,id',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'scheduled_at' => 'required_if:schedule_type,scheduled|required_if:schedule_type,recurring|nullable|date|after:now',
            'recurrence_type' => 'nullable|in:daily,weekly,monthly',
            'recurrence_count' => 'nullable|integer|min:1',
        ]);

        $broadcast = $this->broadcastService->updateBroadcast($id, $orgAccount->organization_id, $validated);

        if (!$broadcast) {
            return redirect()->back()->with('error', 'This broadcast cannot be updated.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_updated',
            'resource_type' => 'broadcast',
            'description' => 'Updated a broadcast' . ($validated['title'] ?? '' ? ': ' . $validated['title'] : ''),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->route('org.broadcasts.show', $broadcast->id)->with('success', 'Broadcast updated successfully.');
    }

    public function cancel(Request $request, int $id)
    {
        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $broadcast = $this->broadcastService->cancelBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot cancel this broadcast.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_cancelled',
            'resource_type' => 'broadcast',
            'description' => 'Cancelled a broadcast',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Broadcast cancelled successfully.');
    }

    // Approval workflow
    public function approve(Request $request, int $id)
    {
        $this->authorizeOrg('manage-broadcasts');
        $orgAccount = Auth::guard('org')->user();

        $broadcast = $this->broadcastService->approveBroadcast($id, $orgAccount->organization_id, $orgAccount->id);

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot approve this broadcast.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_approved',
            'resource_type' => 'broadcast',
            'description' => 'Approved broadcast: ' . ($broadcast->title ?? 'Untitled'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Broadcast approved and queued for delivery.');
    }

    public function reject(Request $request, int $id)
    {
        $this->authorizeOrg('manage-broadcasts');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:1000',
        ]);

        $broadcast = $this->broadcastService->rejectBroadcast(
            $id, $orgAccount->organization_id, $orgAccount->id, $validated['rejection_reason']
        );

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot reject this broadcast.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_rejected',
            'resource_type' => 'broadcast',
            'description' => 'Rejected broadcast: ' . ($broadcast->title ?? 'Untitled'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Broadcast rejected.');
    }

    // Moderation
    public function flag(Request $request, int $id)
    {
        $this->authorizeOrg('manage-broadcasts');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'flag_reason' => 'required|string|max:1000',
        ]);

        $broadcast = $this->broadcastService->flagBroadcast(
            $id, $orgAccount->organization_id, $orgAccount->id, $validated['flag_reason']
        );

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot flag this broadcast.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_flagged',
            'resource_type' => 'broadcast',
            'description' => 'Flagged broadcast: ' . ($broadcast->title ?? 'Untitled'),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Broadcast flagged for review.');
    }

    public function unflag(Request $request, int $id)
    {
        $this->authorizeOrg('manage-broadcasts');
        $orgAccount = Auth::guard('org')->user();

        $broadcast = $this->broadcastService->unflagBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot unflag this broadcast.');
        }

        $this->activityLogRepo->create([
            'org_account_id' => $orgAccount->id,
            'organization_id' => $orgAccount->organization_id,
            'action_type' => 'broadcast_unflagged',
            'resource_type' => 'broadcast',
            'description' => 'Unflagged broadcast',
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return redirect()->back()->with('success', 'Broadcast unflagged.');
    }

    // Analytics
    public function analytics(int $id)
    {
        if (!$this->canAccessBroadcasts()) {
            abort(403);
        }

        $orgAccount = Auth::guard('org')->user();
        $analytics = $this->broadcastService->getAnalytics($id, $orgAccount->organization_id);

        if (!$analytics) {
            return response()->json(['error' => 'Broadcast not found.'], 404);
        }

        return response()->json($analytics);
    }

    private function formatBroadcast(OrgBroadcast $broadcast): array
    {
        return [
            'id' => $broadcast->id,
            'uuid' => $broadcast->uuid,
            'title' => $broadcast->title,
            'category' => $broadcast->category,
            'category_label' => OrgBroadcast::CATEGORIES[$broadcast->category] ?? $broadcast->category,
            'priority' => $broadcast->priority,
            'priority_label' => OrgBroadcast::PRIORITIES[$broadcast->priority] ?? $broadcast->priority,
            'message' => $broadcast->message,
            'target_type' => $broadcast->target_type,
            'target_class_set_ids' => $broadcast->target_class_set_ids,
            'schedule_type' => $broadcast->schedule_type,
            'scheduled_at' => $broadcast->scheduled_at?->toDateTimeString(),
            'recurrence_type' => $broadcast->recurrence_type,
            'recurrence_count' => $broadcast->recurrence_count,
            'recurrences_sent' => $broadcast->recurrences_sent,
            'status' => $broadcast->status,
            'requires_approval' => $broadcast->requires_approval,
            'approval_status' => $broadcast->approval_status,
            'approved_at' => $broadcast->approved_at?->toDateTimeString(),
            'rejection_reason' => $broadcast->rejection_reason,
            'approver' => $broadcast->approver ? [
                'display_name' => $broadcast->approver->display_name,
                'username' => $broadcast->approver->username,
            ] : null,
            'is_flagged' => $broadcast->is_flagged,
            'flag_reason' => $broadcast->flag_reason,
            'flagged_at' => $broadcast->flagged_at?->toDateTimeString(),
            'flagger' => $broadcast->flagger ? [
                'display_name' => $broadcast->flagger->display_name,
                'username' => $broadcast->flagger->username,
            ] : null,
            'sent_at' => $broadcast->sent_at?->toDateTimeString(),
            'sent_to_count' => $broadcast->sent_to_count,
            'delivery_details' => $broadcast->delivery_details,
            'created_at' => $broadcast->created_at->toDateTimeString(),
            'creator' => [
                'display_name' => $broadcast->creator->display_name ?? null,
                'username' => $broadcast->creator->username,
            ],
        ];
    }
}
