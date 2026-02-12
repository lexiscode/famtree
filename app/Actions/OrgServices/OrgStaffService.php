<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgAccountRepository;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;

class OrgStaffService
{
    public function __construct(
        private OrgAccountRepository $accountRepo,
    ) {}

    public function getStaff(int $organizationId): Collection
    {
        return $this->accountRepo->getByOrganization($organizationId);
    }

    public function createStaff(int $organizationId, array $data): \App\Models\OrgModels\OrgAccount
    {
        return $this->accountRepo->create([
            'organization_id' => $organizationId,
            'username' => $data['username'],
            'email' => $data['email'] ?? null,
            'password' => Hash::make($data['password']),
            'role' => $data['role'] ?? 'moderator',
            'permissions' => $data['permissions'] ?? null,
            'display_name' => $data['display_name'] ?? null,
            'is_active' => true,
        ]);
    }

    public function updateStaff(int $id, int $organizationId, array $data): ?\App\Models\OrgModels\OrgAccount
    {
        $account = $this->accountRepo->findById($id);

        if (!$account || $account->organization_id !== $organizationId) {
            return null;
        }

        if ($account->role === 'owner' && isset($data['role']) && $data['role'] !== 'owner') {
            return null;
        }

        $updateData = array_filter([
            'role' => $data['role'] ?? null,
            'permissions' => $data['permissions'] ?? null,
            'display_name' => $data['display_name'] ?? null,
            'is_active' => $data['is_active'] ?? null,
        ], fn ($v) => $v !== null);

        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        return $this->accountRepo->update($id, $updateData);
    }

    public function deleteStaff(int $id, int $organizationId): bool
    {
        $account = $this->accountRepo->findById($id);

        if (!$account || $account->organization_id !== $organizationId) {
            return false;
        }

        if ($account->role === 'owner') {
            return false;
        }

        return $this->accountRepo->delete($id);
    }
}
