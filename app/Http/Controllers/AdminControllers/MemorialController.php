<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\MemorialService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MemorialController extends Controller
{
    public function __construct(private MemorialService $memorialService) {}

    public function verifications(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $verifications = $this->memorialService->getAllVerifications($perPage, $page);
        return Inertia::render('AdminPages/Memorial/Verifications', ['verifications' => $verifications, 'statistics' => $this->memorialService->getStats(), 'perPage' => $perPage]);
    }

    public function verificationDetail(int $id)
    {
        $verification = $this->memorialService->getVerificationDetails($id);
        if (!$verification) { return redirect()->route('admin.memorial.verifications')->with('error', 'Verification not found'); }
        return Inertia::render('AdminPages/Memorial/VerificationDetail', ['verification' => $verification]);
    }

    public function cancel(Request $request, int $id)
    {
        $success = $this->memorialService->cancelVerification($id, $request->input('reason', ''));
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Verification cancelled' : 'Failed to cancel');
    }

    public function expedite(int $id)
    {
        $success = $this->memorialService->expediteVerification($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Verification expedited' : 'Failed to expedite');
    }

    public function overrideDeceased(int $id)
    {
        $success = $this->memorialService->overrideDeceased($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'User marked as deceased' : 'Failed');
    }

    public function overrideAlive(int $id)
    {
        $success = $this->memorialService->overrideAlive($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'User marked as alive' : 'Failed');
    }

    public function memorializedUsers(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $users = $this->memorialService->getMemorializedUsers($perPage, $page);
        return Inertia::render('AdminPages/Memorial/MemorializedUsers', ['users' => $users, 'statistics' => $this->memorialService->getStats(), 'perPage' => $perPage]);
    }
}
