<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HowItWorksController extends Controller
{
    /**
     * Display the how it works page
     */
    public function index()
    {
        return Inertia::render('GuestPages/HowItWorks/Index');
    }
}
