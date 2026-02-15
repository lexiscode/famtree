<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\NotificationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NotificationController extends Controller
{
    public function __construct(
        private NotificationService $notificationService
    ) {
    }

    /**
     * Display broadcast notification form
     */
    public function broadcast()
    {
        return Inertia::render('AdminPages/Notifications/Broadcast');
    }

    /**
     * Send broadcast notification
     */
    public function sendBroadcast(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'type' => 'nullable|string|max:50',
            'filters' => 'nullable|array',
            'filters.account_status' => 'nullable|string',
            'filters.gender' => 'nullable|string',
            'filters.two_fa_enabled' => 'nullable|boolean',
            'filters.is_child_account' => 'nullable|boolean',
        ]);

        $result = $this->notificationService->sendBroadcast($data);

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }

    /**
     * Display notification history
     */
    public function history(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        $data = $this->notificationService->getHistory($perPage, $page);

        return Inertia::render('AdminPages/Notifications/History', [
            'notifications' => $data['notifications'],
            'perPage' => $perPage,
        ]);
    }
}
