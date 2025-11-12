<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class HomeController extends Controller
{
    /**
     * Display the home page
     */
    public function index()
    {
        return Inertia::render('GuestPages/Home/Index');
    }
}
