<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use Inertia\Inertia;

class ContactController extends Controller
{
    /**
     * Display the contact page
     */
    public function index()
    {
        return Inertia::render('GuestPages/Contact/Index');
    }

    /**
     * Handle contact form submission
     */
    public function store()
    {
        // TODO: Implement contact form submission logic
        // Validate input
        // Send email to admin
        // Return success response
    }
}
