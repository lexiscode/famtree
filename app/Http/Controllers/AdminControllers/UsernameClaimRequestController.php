<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\UsernameClaimRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsernameClaimRequestController extends Controller
{
    public function __construct(private UsernameClaimRequestService $service) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        return Inertia::render('AdminPages/ReservedUsernames/ClaimRequests', [
            'claimRequests' => $this->service->getAll($perPage, $page, $search, $status),
            'statistics' => $this->service->getStats(),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'perPage' => $perPage,
        ]);
    }

    public function generateCode(int $id)
    {
        $code = $this->service->generateCode($id);

        if ($code) {
            return redirect()->back()->with('success', "Verification code generated: {$code}. Send this code to the claimant and ask them to post it on their verified social media.");
        }

        return redirect()->back()->with('error', 'Failed to generate verification code.');
    }

    public function sendCode(int $id)
    {
        $success = $this->service->sendCode($id);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Verification code sent to the claimant\'s email.' : 'Failed to send verification code. Make sure a code has been generated first.'
        );
    }

    public function verify(Request $request, int $id)
    {
        $adminNotes = $request->input('admin_notes');
        $success = $this->service->verify($id, $adminNotes);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Claim request verified. You can now reassign the username from the Reserved Usernames page.' : 'Failed to verify claim request.'
        );
    }

    public function reject(Request $request, int $id)
    {
        $adminNotes = $request->input('admin_notes');
        $success = $this->service->reject($id, $adminNotes);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Claim request rejected.' : 'Failed to reject claim request.'
        );
    }

    public function destroy(int $id)
    {
        $success = $this->service->delete($id);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Claim request deleted.' : 'Failed to delete claim request.'
        );
    }
}
