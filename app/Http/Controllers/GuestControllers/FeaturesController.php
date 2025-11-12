<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class FeaturesController extends Controller
{
    /**
     * Display the features page
     */
    public function index()
    {
        return Inertia::render('GuestPages/Features/Index');
    }
}
