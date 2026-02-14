<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\ReportService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BlockController extends Controller
{
    public function __construct(private ReportService $reportService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $blocks = $this->reportService->getAllBlocks($perPage, $page);
        return Inertia::render('AdminPages/Reports/Blocks', ['blocks' => $blocks, 'perPage' => $perPage]);
    }

    public function destroy(int $id)
    {
        $success = $this->reportService->removeBlock($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Block removed successfully' : 'Failed to remove block');
    }
}
