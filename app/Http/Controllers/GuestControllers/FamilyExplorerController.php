<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FamilyExplorerController extends Controller
{
    /**
     * Display the family explorer page with public families
     */
    public function index()
    {
        // TODO: Fetch public families from database
        return Inertia::render('GuestPages/FamilyExplorer/Index', [
            'families' => [], // Placeholder for public families
        ]);
    }
}
