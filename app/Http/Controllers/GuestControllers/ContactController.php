<?php

namespace App\Http\Controllers\GuestControllers;

use App\Actions\GuestServices\ContactService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function __construct(private ContactService $contactService) {}

    /**
     * Display the contact page
     */
    public function index(): Response
    {
        return Inertia::render('GuestPages/Contact/Index');
    }

    /**
     * Handle contact form submission
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        // Submit form through service
        $result = $this->contactService->submitForm($validated);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['message' => $result['message']]);
    }
}
