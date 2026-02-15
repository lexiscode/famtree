<?php
namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\PostModerationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GalleryController extends Controller
{
    public function __construct(private PostModerationService $postService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $galleries = $this->postService->getAllGalleries($perPage, $page);
        return Inertia::render('AdminPages/Content/Galleries', ['galleries' => $galleries, 'perPage' => $perPage]);
    }

    public function show(int $id) { return redirect()->back(); }

    public function destroy(int $id)
    {
        $success = $this->postService->deleteGallery($id);
        if ($success) {
            return redirect()->back()->with('success', 'Gallery item deleted successfully');
        }
        return redirect()->back()->with('error', 'Failed to delete gallery item');
    }

    public function destroyImage(int $id)
    {
        return redirect()->back()->with('success', 'Image removed');
    }
}
