<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\ElectionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ElectionController extends Controller
{
    public function __construct(private ElectionService $electionService)
    {
    }

    /**
     * Display elections list
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

        $elections = $this->electionService->getAllElections($filters, $perPage, $page);
        $statistics = $this->electionService->getStats();

        return Inertia::render('AdminPages/Groups/Elections', [
            'elections' => $elections,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show election details
     */
    public function show(int $id)
    {
        $election = $this->electionService->getElectionDetails($id);

        if (!$election) {
            return redirect()->route('admin.elections.index')->with('error', 'Election not found');
        }

        return Inertia::render('AdminPages/Groups/ElectionDetail', [
            'election' => $election,
        ]);
    }

    /**
     * Cancel an election
     */
    public function cancel(int $id)
    {
        $success = $this->electionService->cancelElection($id);

        if ($success) {
            return redirect()->back()->with('success', 'Election cancelled successfully');
        }

        return redirect()->back()->with('error', 'Failed to cancel election');
    }

    /**
     * Extend an election deadline
     */
    public function extend(Request $request, int $id)
    {
        $request->validate(['hours' => 'nullable|integer|min:1|max:168']);

        $hours = $request->input('hours', 24);
        $success = $this->electionService->extendElection($id, $hours);

        if ($success) {
            return redirect()->back()->with('success', "Election extended by {$hours} hours");
        }

        return redirect()->back()->with('error', 'Failed to extend election');
    }
}
