<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Repositories\AdminRepositories\RemovalRepository;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class RemovalController extends Controller
{
    public function __construct(private RemovalRepository $removalRepo)
    {
    }

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);

        $removals = $this->removalRepo->getAllPaginated($perPage, $page)->through(function ($removal) {
            return [
                'id' => $removal->id,
                'status' => $removal->status,
                'reason' => $removal->reason,
                'votes_count' => $removal->votes_count,
                'expires_at' => $removal->expires_at?->format('Y-m-d H:i:s'),
                'expires_at_formatted' => $removal->expires_at?->diffForHumans() ?? 'N/A',
                'target_user' => $removal->targetUser ? [
                    'id' => $removal->targetUser->id,
                    'full_name' => "{$removal->targetUser->first_name} {$removal->targetUser->last_name}",
                    'username' => $removal->targetUser->username,
                ] : null,
                'initiator' => $removal->initiator ? [
                    'id' => $removal->initiator->id,
                    'full_name' => "{$removal->initiator->first_name} {$removal->initiator->last_name}",
                    'username' => $removal->initiator->username,
                ] : null,
                'class_set' => $removal->classSet ? [
                    'id' => $removal->classSet->id,
                    'name' => $removal->classSet->name,
                ] : null,
                'created_at' => $removal->created_at->format('Y-m-d'),
                'created_at_formatted' => $removal->created_at->diffForHumans(),
            ];
        });

        $statistics = [
            'total' => $this->removalRepo->count(),
            'pending' => $this->removalRepo->countPending(),
        ];

        return Inertia::render('AdminPages/Groups/Removals', [
            'removals' => $removals,
            'statistics' => $statistics,
            'perPage' => $perPage,
        ]);
    }

    public function show(int $id)
    {
        $removal = $this->removalRepo->find($id);

        if (!$removal) {
            return redirect()->route('admin.removals.index')->with('error', 'Removal process not found');
        }

        $data = [
            'id' => $removal->id,
            'status' => $removal->status,
            'reason' => $removal->reason,
            'votes_count' => $removal->votes_count,
            'expires_at' => $removal->expires_at?->format('Y-m-d H:i:s'),
            'expires_at_formatted' => $removal->expires_at?->diffForHumans() ?? 'N/A',
            'target_user' => $removal->targetUser ? [
                'id' => $removal->targetUser->id,
                'full_name' => "{$removal->targetUser->first_name} {$removal->targetUser->last_name}",
                'username' => $removal->targetUser->username,
            ] : null,
            'initiator' => $removal->initiator ? [
                'id' => $removal->initiator->id,
                'full_name' => "{$removal->initiator->first_name} {$removal->initiator->last_name}",
                'username' => $removal->initiator->username,
            ] : null,
            'class_set' => $removal->classSet ? [
                'id' => $removal->classSet->id,
                'name' => $removal->classSet->name,
            ] : null,
            'votes' => $removal->votes->map(function ($vote) {
                return [
                    'id' => $vote->id,
                    'vote' => $vote->vote,
                    'user' => $vote->adminUser ? [
                        'id' => $vote->adminUser->id,
                        'full_name' => "{$vote->adminUser->first_name} {$vote->adminUser->last_name}",
                        'username' => $vote->adminUser->username,
                    ] : null,
                    'created_at' => $vote->created_at?->format('Y-m-d H:i:s'),
                ];
            })->toArray(),
            'created_at' => $removal->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $removal->created_at->diffForHumans(),
        ];

        return Inertia::render('AdminPages/Groups/RemovalDetail', ['removal' => $data]);
    }

    public function cancel(int $id)
    {
        $success = $this->removalRepo->cancel($id);

        if ($success) {
            $this->logActivity('cancel_removal', 'GroupMemberRemoval', $id, "Cancelled removal process #{$id}");
            return redirect()->back()->with('success', 'Removal process cancelled');
        }

        return redirect()->back()->with('error', 'Failed to cancel removal process');
    }

    public function execute(int $id)
    {
        $success = $this->removalRepo->execute($id);

        if ($success) {
            $this->logActivity('execute_removal', 'GroupMemberRemoval', $id, "Force executed removal process #{$id}");
            return redirect()->back()->with('success', 'Removal executed — member removed from group');
        }

        return redirect()->back()->with('error', 'Failed to execute removal');
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();
            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail
        }
    }
}
