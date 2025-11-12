<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class BlogController extends Controller
{
    /**
     * Display the blog index page
     */
    public function index()
    {
        return Inertia::render('GuestPages/Blog/Index');
    }

    /**
     * Display a single blog post
     */
    public function show($slug)
    {
        return Inertia::render('GuestPages/Blog/Show', [
            'slug' => $slug,
        ]);
    }
}
