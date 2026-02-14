<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\FamilyTreeService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ConnectionController extends Controller
{
    public function __construct(private FamilyTreeService $familyTreeService)
    {
    }

    /**
     * Display platform-wide connection stats
     */
    public function index(Request $request)
    {
        $connectionStats = $this->familyTreeService->getConnectionStats();
        $treeStats = $this->familyTreeService->getStats();

        return Inertia::render('AdminPages/Connections/Index', [
            'connectionStats' => $connectionStats,
            'treeStats' => $treeStats,
        ]);
    }
}
