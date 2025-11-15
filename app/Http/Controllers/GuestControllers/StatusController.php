<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\GuestRequests\AuthAccessRequests\UpdateStatusRequest;
use App\Actions\GuestServices\StatusService;
use Illuminate\Support\Facades\Redirect;

class StatusController extends Controller
{
    public function __construct(
        private StatusService $statusService,
    ) {}

    /**
     * Update user status (Alive/Deceased)
     */
    public function updateStatus(UpdateStatusRequest $request)
    {
        $user = auth()->user();
        $userId = $request->input('user_id', $user->id);
        $validated = $request->validated();

        try {
            $this->statusService->updateStatus(
                $userId,
                $user->id,
                $validated['status'],
                $validated['death_date'] ?? null
            );

            return back()->with('success', 'Status updated successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }
    }
}
