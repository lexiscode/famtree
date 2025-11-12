<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class AboutController extends Controller
{
    /**
     * Display the about page
     */
    public function index()
    {
        return Inertia::render('GuestPages/About/Index');
    }
}
