<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\FamilyExplorerService;
use Inertia\Inertia;
use Illuminate\Http\Request;

class FamilyExplorerController extends Controller
{
    public function __construct(private FamilyExplorerService $familyExplorerService)
    {
    }

    /**
     * Display the family explorer page with families list
     */
    public function index(Request $request)
    {
        // Get query parameters
        $search = $request->query('search');
        $state = $request->query('state');
        $sortBy = $request->query('sort', 'name');

        // Get families using the service
        $paginatedFamilies = $this->familyExplorerService->getFamilies(
            search: $search,
            state: $state,
            sortBy: $sortBy,
            page: $request->query('page', 1)
        );

        // Get available states for filter dropdown
        $states = $this->familyExplorerService->getAvailableStates();

        return Inertia::render('GuestPages/FamilyExplorer/Index', [
            'families' => [
                'data' => $paginatedFamilies->items(),
                'meta' => [
                    'current_page' => $paginatedFamilies->currentPage(),
                    'per_page' => $paginatedFamilies->perPage(),
                    'total' => $paginatedFamilies->total(),
                    'last_page' => $paginatedFamilies->lastPage(),
                    'from' => $paginatedFamilies->firstItem(),
                    'to' => $paginatedFamilies->lastItem(),
                ],
            ],
            'states' => $states,
            'filters' => [
                'search' => $search,
                'state' => $state,
                'sort' => $sortBy,
            ],
        ]);
    }
}
