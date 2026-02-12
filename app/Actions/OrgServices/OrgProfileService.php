<?php

namespace App\Actions\OrgServices;

use App\Models\GuestModels\Organization;

class OrgProfileService
{
    public function getProfile(int $organizationId): ?Organization
    {
        return Organization::with('category')->find($organizationId);
    }

    public function updateProfile(int $organizationId, array $data): ?Organization
    {
        $org = Organization::findOrFail($organizationId);
        $org->update($data);
        return $org->fresh();
    }
}
