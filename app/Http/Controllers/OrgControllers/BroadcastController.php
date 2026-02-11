<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgBroadcastService;
use App\Models\GuestModels\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BroadcastController extends Controller
{
    public function __construct(
        private OrgBroadcastService $broadcastService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Broadcasts/Index', [
            'broadcasts' => $this->broadcastService->getBroadcasts($orgAccount->organization_id),
        ]);
    }

    public function create()
    {
        $orgAccount = Auth::guard('org')->user();
        $org = Organization::with('faculties.departments.classSets')->find($orgAccount->organization_id);

        $groups = [];
        if ($org) {
            foreach ($org->faculties as $faculty) {
                foreach ($faculty->departments as $dept) {
                    foreach ($dept->classSets as $classSet) {
                        $groups[] = [
                            'id' => $classSet->id,
                            'name' => $classSet->name,
                            'faculty' => $faculty->name,
                            'department' => $dept->name,
                        ];
                    }
                }
            }
        }

        return Inertia::render('OrgPages/Broadcasts/Create', [
            'groups' => $groups,
        ]);
    }

    public function store(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'message' => 'required|string',
            'target_type' => 'required|in:all_groups,selected_groups',
            'target_class_set_ids' => 'nullable|array',
            'target_class_set_ids.*' => 'integer|exists:class_sets,id',
            'schedule_type' => 'required|in:immediate,scheduled,recurring',
            'scheduled_at' => 'nullable|date|after:now',
            'recurrence_type' => 'nullable|in:daily,weekly',
            'recurrence_count' => 'nullable|integer|min:1',
        ]);

        $this->broadcastService->createBroadcast([
            'organization_id' => $orgAccount->organization_id,
            'org_account_id' => $orgAccount->id,
            ...$validated,
        ]);

        return redirect()->route('org.broadcasts.index')->with('success', 'Broadcast created successfully.');
    }

    public function show(int $id)
    {
        $orgAccount = Auth::guard('org')->user();
        $broadcast = $this->broadcastService->getBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast) {
            return redirect()->route('org.broadcasts.index')->with('error', 'Broadcast not found.');
        }

        return Inertia::render('OrgPages/Broadcasts/Show', [
            'broadcast' => $broadcast,
        ]);
    }

    public function cancel(int $id)
    {
        $orgAccount = Auth::guard('org')->user();
        $broadcast = $this->broadcastService->cancelBroadcast($id, $orgAccount->organization_id);

        if (!$broadcast) {
            return redirect()->back()->with('error', 'Cannot cancel this broadcast.');
        }

        return redirect()->back()->with('success', 'Broadcast cancelled successfully.');
    }
}
