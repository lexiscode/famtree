<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\ContactService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function __construct(private ContactService $contactService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $submissions = $this->contactService->getAllSubmissions($perPage, $page);
        return Inertia::render('AdminPages/Contact/Index', ['submissions' => $submissions, 'statistics' => $this->contactService->getStats(), 'perPage' => $perPage]);
    }

    public function show(int $id)
    {
        $submission = $this->contactService->getDetails($id);
        if (!$submission) { return redirect()->route('admin.contact.index')->with('error', 'Submission not found'); }
        $this->contactService->markAsRead($id);
        return Inertia::render('AdminPages/Contact/Show', ['submission' => $submission]);
    }

    public function markRead(int $id)
    {
        $success = $this->contactService->markAsRead($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Marked as read' : 'Failed');
    }

    public function respond(Request $request, int $id) { return redirect()->back()->with('success', 'Response sent'); }

    public function destroy(int $id)
    {
        $success = $this->contactService->deleteSubmission($id);
        return redirect()->route('admin.contact.index')->with($success ? 'success' : 'error', $success ? 'Submission deleted' : 'Failed to delete');
    }
}
