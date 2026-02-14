<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function __construct(
        private SettingsService $settingsService
    ) {
    }

    /**
     * Display settings page
     */
    public function index()
    {
        $data = $this->settingsService->getAllSettings();

        return Inertia::render('AdminPages/Settings/Index', [
            'settings' => $data['settings'],
            'groups' => $data['groups'],
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $settings = $request->input('settings', []);

        if (empty($settings)) {
            return redirect()->back()->with('error', 'No settings provided');
        }

        $success = $this->settingsService->updateSettings($settings);

        if ($success) {
            return redirect()->back()->with('success', 'Settings updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update settings');
    }

    /**
     * Clear application cache
     */
    public function clearCache()
    {
        $success = $this->settingsService->clearCache();

        if ($success) {
            return redirect()->back()->with('success', 'Application cache cleared successfully');
        }

        return redirect()->back()->with('error', 'Failed to clear cache');
    }

    /**
     * Toggle maintenance mode
     */
    public function toggleMaintenance()
    {
        $result = $this->settingsService->toggleMaintenance();

        if ($result['success']) {
            return redirect()->back()->with('success', $result['message']);
        }

        return redirect()->back()->with('error', $result['message']);
    }
}
