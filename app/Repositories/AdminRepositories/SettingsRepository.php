<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminModels\SystemSetting;
use Illuminate\Database\Eloquent\Collection;

class SettingsRepository
{
    /**
     * Get all settings
     */
    public function getAll(): Collection
    {
        return SystemSetting::with('updatedBy')->orderBy('group')->orderBy('key')->get();
    }

    /**
     * Get settings by group
     */
    public function getByGroup(string $group): Collection
    {
        return SystemSetting::with('updatedBy')->byGroup($group)->orderBy('key')->get();
    }

    /**
     * Get a single setting by key
     */
    public function get(string $key): ?SystemSetting
    {
        return SystemSetting::where('key', $key)->first();
    }

    /**
     * Set a setting value
     */
    public function set(string $key, mixed $value, ?int $adminId = null): SystemSetting
    {
        $setting = SystemSetting::where('key', $key)->first();

        if ($setting) {
            $setting->update([
                'value' => $value,
                'updated_by_admin_id' => $adminId,
            ]);
        } else {
            $setting = SystemSetting::create([
                'key' => $key,
                'value' => $value,
                'updated_by_admin_id' => $adminId,
            ]);
        }

        return $setting;
    }

    /**
     * Get all distinct groups
     */
    public function getGroups(): array
    {
        return SystemSetting::select('group')->distinct()->pluck('group')->toArray();
    }
}
