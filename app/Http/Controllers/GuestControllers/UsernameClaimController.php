<?php

namespace App\Http\Controllers\GuestControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\UsernameClaimRequestService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsernameClaimController extends Controller
{
    public function __construct(private UsernameClaimRequestService $service) {}

    public function index()
    {
        return Inertia::render('GuestPages/ClaimUsername/Index');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|min:3|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'social_media_url' => 'required|url|max:500',
            'message' => 'nullable|string|max:2000',
        ]);

        $result = $this->service->submitRequest($validated);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->withErrors(['username' => $result['message']])->withInput();
    }
}
