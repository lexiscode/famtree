<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\FamilyTreeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FamilyTreeController extends Controller
{
    public function __construct(private FamilyTreeService $familyTreeService)
    {
    }

    /**
     * Display family trees list
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        if ($search) {
            $filters['search'] = $search;
        }

        $trees = $this->familyTreeService->getAllTrees($filters, $perPage, $page);
        $statistics = $this->familyTreeService->getStats();

        return Inertia::render('AdminPages/FamilyTrees/Index', [
            'trees' => $trees,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show family tree details
     */
    public function show(int $id)
    {
        $tree = $this->familyTreeService->getTreeDetails($id);

        if (!$tree) {
            return redirect()->route('admin.familyTrees.index')->with('error', 'Family tree not found');
        }

        return Inertia::render('AdminPages/FamilyTrees/Show', [
            'tree' => $tree,
        ]);
    }

    /**
     * Delete a family tree
     */
    public function destroy(int $id)
    {
        $success = $this->familyTreeService->deleteTree($id);

        if ($success) {
            return redirect()->route('admin.familyTrees.index')->with('success', 'Family tree deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete family tree');
    }

    /**
     * Toggle family tree visibility
     */
    public function toggleVisibility(int $id)
    {
        $success = $this->familyTreeService->toggleVisibility($id);

        if ($success) {
            return redirect()->back()->with('success', 'Family tree visibility updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update family tree visibility');
    }
}
