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
            'org_role_id' => $data['org_role_id'],
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

        // Don't allow changing owner's role
        if ($account->isOwner() && isset($data['org_role_id'])) {
            return null;
        }

        $updateData = array_filter([
            'org_role_id' => $data['org_role_id'] ?? null,
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

        if ($account->isOwner()) {
            return false;
        }

        return $this->accountRepo->delete($id);
    }
}
