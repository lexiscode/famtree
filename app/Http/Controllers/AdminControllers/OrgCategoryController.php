<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\OrgCategoryService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrgCategoryController extends Controller
{
    public function __construct(private OrgCategoryService $categoryService)
    {
    }

    public function index()
    {
        $categories = $this->categoryService->getAllCategories();

        return Inertia::render('AdminPages/Organizations/Categories', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255|unique:organization_categories,name',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $success = $this->categoryService->createCategory($data);

        if ($success) {
            return redirect()->back()->with('success', 'Category created successfully');
        }

        return redirect()->back()->with('error', 'Failed to create category');
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'icon' => 'nullable|string|max:50',
            'display_order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $success = $this->categoryService->updateCategory($id, $data);

        if ($success) {
            return redirect()->back()->with('success', 'Category updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update category');
    }

    public function destroy(int $id)
    {
        $success = $this->categoryService->deleteCategory($id);

        if ($success) {
            return redirect()->back()->with('success', 'Category deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete category. It may still have organizations assigned.');
    }
}
