<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class LandingPageController extends Controller
{
    /**
     * Display the home page
     */
    public function index()
    {
        return Inertia::render('GuestPages/AuthAccessPages/LandingPage/Index');
    }
}
