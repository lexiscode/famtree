<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\SettingsRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Artisan;

class SettingsService
{
    public function __construct(private SettingsRepository $repository)
    {
    }

    /**
     * Get all settings grouped by category
     */
    public function getAllSettings(): array
    {
        $settings = $this->repository->getAll();
        $groups = $this->repository->getGroups();

        $grouped = [];
        foreach ($groups as $group) {
            $grouped[$group] = $settings->where('group', $group)->map(function ($setting) {
                return [
                    'id' => $setting->id,
                    'key' => $setting->key,
                    'value' => $setting->value,
                    'group' => $setting->group,
                    'description' => $setting->description,
                    'is_editable' => $setting->is_editable,
                    'updated_by' => $setting->updatedBy?->username ?? null,
                    'updated_at' => $setting->updated_at?->format('Y-m-d H:i:s'),
                ];
            })->values()->toArray();
        }

        return [
            'settings' => $grouped,
            'groups' => $groups,
        ];
    }

    /**
     * Update multiple settings
     */
    public function updateSettings(array $settings): bool
    {
        try {
            $admin = Auth::guard('admin')->user();

            foreach ($settings as $key => $value) {
                $existing = $this->repository->get($key);

                if ($existing && !$existing->is_editable) {
                    continue;
                }

                $this->repository->set($key, $value, $admin?->id);
            }

            $this->logActivity('update_settings', 'SystemSetting', 0, 'Updated system settings: ' . implode(', ', array_keys($settings)));

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Clear application cache
     */
    public function clearCache(): bool
    {
        try {
            Artisan::call('cache:clear');
            Artisan::call('config:clear');
            Artisan::call('view:clear');
            Artisan::call('route:clear');

            $this->logActivity('clear_cache', 'System', 0, 'Cleared application cache');

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Toggle maintenance mode
     */
    public function toggleMaintenance(): array
    {
        try {
            $setting = $this->repository->get('maintenance_mode');
            $currentValue = $setting?->value ?? false;
            $newValue = !$currentValue;

            $admin = Auth::guard('admin')->user();
            $this->repository->set('maintenance_mode', $newValue, $admin?->id);

            if ($newValue) {
                Artisan::call('down', ['--secret' => 'admin-bypass']);
            } else {
                Artisan::call('up');
            }

            $status = $newValue ? 'enabled' : 'disabled';
            $this->logActivity('toggle_maintenance', 'System', 0, "Maintenance mode {$status}");

            return [
                'success' => true,
                'maintenance_mode' => $newValue,
                'message' => "Maintenance mode {$status}",
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to toggle maintenance mode',
            ];
        }
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
        }
    }
}
