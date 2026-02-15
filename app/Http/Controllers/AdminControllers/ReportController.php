<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);
        $filters = array_filter($filters, fn($v) => $v !== null && $v !== '' && $v !== 'undefined');

        if (!empty($filters) || !empty($search)) {
            $filters['search'] = $search;
            $reports = $this->reportService->getFilteredReports($filters, $perPage, $page);
        } else {
            $reports = $this->reportService->getAllReports($perPage, $page);
        }

        return Inertia::render('AdminPages/Reports/Index', [
            'reports' => $reports,
            'statistics' => $this->reportService->getReportStats(),
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    public function show(int $id)
    {
        $report = $this->reportService->getReportDetails($id);
        if (!$report) {
            return redirect()->route('admin.reports.index')->with('error', 'Report not found');
        }
        return Inertia::render('AdminPages/Reports/Show', ['report' => $report]);
    }

    public function review(int $id)
    {
        $success = $this->reportService->reviewReport($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Report marked as reviewing' : 'Failed to update report');
    }

    public function resolve(Request $request, int $id)
    {
        $request->validate(['admin_notes' => 'nullable|string']);
        $success = $this->reportService->resolveReport($id, $request->input('admin_notes', ''));
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Report resolved successfully' : 'Failed to resolve report');
    }

    public function dismiss(Request $request, int $id)
    {
        $request->validate(['admin_notes' => 'nullable|string']);
        $success = $this->reportService->dismissReport($id, $request->input('admin_notes', ''));
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Report dismissed' : 'Failed to dismiss report');
    }
}
