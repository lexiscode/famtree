<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Http\Controllers\OrgControllers\Traits\AuthorizesOrgActions;
use App\Actions\OrgServices\OrgProfileService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    use AuthorizesOrgActions;
    public function __construct(
        private OrgProfileService $profileService,
    ) {}

    public function show()
    {
        $this->authorizeOrg('manage-profile');
        $orgAccount = Auth::guard('org')->user();

        return Inertia::render('OrgPages/Profile/Edit', [
            'organization' => $this->profileService->getProfile($orgAccount->organization_id),
        ]);
    }

    public function update(Request $request)
    {
        $this->authorizeOrg('manage-profile');
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

    public function uploadImage(Request $request)
    {
        $this->authorizeOrg('manage-profile');
        $orgAccount = Auth::guard('org')->user();

        $validated = $request->validate([
            'type' => 'required|in:logo,cover_image,leader_image',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $type = $validated['type'];

        $folderMap = [
            'logo' => 'org-logos',
            'cover_image' => 'org-covers',
            'leader_image' => 'org-leaders',
        ];

        // Delete old image if it exists in storage
        $org = $this->profileService->getProfile($orgAccount->organization_id);
        $oldPath = $org->{$type};
        if ($oldPath && !str_starts_with($oldPath, 'http') && !str_starts_with($oldPath, '/')) {
            Storage::disk('public')->delete($oldPath);
        }

        $path = $request->file('image')->store($folderMap[$type], 'public');

        $this->profileService->updateProfile($orgAccount->organization_id, [
            $type => $path,
        ]);

        return redirect()->back()->with('success', ucfirst(str_replace('_', ' ', $type)) . ' updated successfully.');
    }
}
