<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\FamilyExplorerService;
use App\Models\Family;
use Inertia\Inertia;

class FamilyPreviewController extends Controller
{
    public function __construct(private FamilyExplorerService $familyExplorerService)
    {
    }

    /**
     * Display a specific family's preview page
     */
    public function show(Family $slug)
    {
        // The Family model uses 'slug' as route key, so $slug will be resolved automatically
        // from the URL parameter via implicit route model binding

        // Check if family is public or user has permission to view it
        if (!$slug->is_public) {
            abort(404);
        }

        return Inertia::render('GuestPages/FamilyPreview/Index', [
            'family' => $slug,
        ]);
    }
}
