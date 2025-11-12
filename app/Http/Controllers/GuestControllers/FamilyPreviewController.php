<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FamilyPreviewController extends Controller
{
    /**
     * Display a single family preview page
     */
    public function show($slug)
    {
        // TODO: Fetch family data by slug from database
        return Inertia::render('GuestPages/FamilyPreview/Show', [
            'slug' => $slug,
            'family' => [], // Placeholder for family data
        ]);
    }
}
