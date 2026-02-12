<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private OrgProfileService $profileService,
    ) {}

    public function show()
    {
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Profile/Edit', [
            'organization' => $this->profileService->getProfile($orgAccount->organization_id),
        ]);
    }

    public function update(Request $request)
    {
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'vision' => 'nullable|string',
            'mission' => 'nullable|string',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'website' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'leader_name' => 'nullable|string|max:255',
            'leader_title' => 'nullable|string|max:255',
            'leader_qualifications' => 'nullable|string',
        ]);

        $this->profileService->updateProfile($orgAccount->organization_id, $validated);

        return redirect()->back()->with('success', 'Organization profile updated successfully.');
    }
}
