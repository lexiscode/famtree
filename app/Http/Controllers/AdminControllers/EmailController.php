<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\EmailService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmailController extends Controller
{
    public function __construct(
        private EmailService $emailService
    ) {
    }

    /**
     * Display email management index
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        $data = $this->emailService->getEmailHistory($perPage, $page);

        return Inertia::render('AdminPages/Emails/Index', [
            'emails' => $data['emails'],
            'perPage' => $perPage,
        ]);
    }

    /**
     * Display failed emails
     */
    public function failed(Request $request)
    {
        $perPage = $request->input('per_page', 20);
        $page = $request->input('page', 1);

        $data = $this->emailService->getFailedEmails($perPage, $page);

        return Inertia::render('AdminPages/Emails/Index', [
            'failedEmails' => $data['failedEmails'],
            'perPage' => $perPage,
            'viewType' => 'failed',
        ]);
    }

    /**
     * Send test email
     */
    public function test(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|max:255',
        ]);

        $success = $this->emailService->sendTestEmail($data['email']);

        if ($success) {
            return redirect()->back()->with('success', "Test email sent to {$data['email']}");
        }

        return redirect()->back()->with('error', 'Failed to send test email. Check email configuration.');
    }
}
