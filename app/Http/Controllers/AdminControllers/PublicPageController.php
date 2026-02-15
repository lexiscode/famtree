<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\PublicPageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    public function __construct(
        private PublicPageService $pageService
    ) {
    }

    /**
     * Display list of public pages
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);

        $data = $this->pageService->getAllPages($perPage, $page);

        return Inertia::render('AdminPages/PublicPages/Index', [
            'pages' => $data['pages'],
            'stats' => $data['stats'],
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show create page form
     */
    public function create()
    {
        return Inertia::render('AdminPages/PublicPages/Editor', [
            'page' => null,
            'mode' => 'create',
        ]);
    }

    /**
     * Store a new page
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:public_pages,slug',
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'is_published' => 'nullable|boolean',
        ]);

        $page = $this->pageService->createPage($data);

        if ($page) {
            return redirect()->route('admin.public-pages.index')->with('success', "Page '{$page->title}' created successfully");
        }

        return redirect()->back()->with('error', 'Failed to create page')->withInput();
    }

    /**
     * Show edit page form
     */
    public function edit(int $id)
    {
        $page = $this->pageService->getPageDetails($id);

        if (!$page) {
            return redirect()->route('admin.public-pages.index')->with('error', 'Page not found');
        }

        return Inertia::render('AdminPages/PublicPages/Editor', [
            'page' => $page,
            'mode' => 'edit',
        ]);
    }

    /**
     * Update a page
     */
    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:public_pages,slug,' . $id,
            'content' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string|max:500',
            'is_published' => 'nullable|boolean',
        ]);

        $success = $this->pageService->updatePage($id, $data);

        if ($success) {
            return redirect()->route('admin.public-pages.index')->with('success', 'Page updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update page');
    }

    /**
     * Delete a page
     */
    public function destroy(int $id)
    {
        $success = $this->pageService->deletePage($id);

        if ($success) {
            return redirect()->route('admin.public-pages.index')->with('success', 'Page deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete page');
    }

    /**
     * Publish or unpublish a page
     */
    public function publish(Request $request, int $id)
    {
        $publish = $request->input('publish', true);
        $success = $this->pageService->publishPage($id, (bool) $publish);

        $action = $publish ? 'published' : 'unpublished';

        if ($success) {
            return redirect()->back()->with('success', "Page {$action} successfully");
        }

        return redirect()->back()->with('error', "Failed to {$action} page");
    }
}
