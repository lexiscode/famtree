<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgAccount;
use Illuminate\Support\Collection;

class OrgAccountRepository
{
    public function findById(int $id): ?OrgAccount
    {
        return OrgAccount::with('orgRole')->find($id);
    }

    public function findByEmail(string $email): ?OrgAccount
    {
        return OrgAccount::where('email', $email)->first();
    }

    public function getByOrganization(int $organizationId): Collection
    {
        return OrgAccount::with(['orgRole', 'linkedOrgGroup:id,name'])
            ->where('organization_id', $organizationId)
            ->orderBy('created_at')
            ->get();
    }

    public function create(array $data): OrgAccount
    {
        return OrgAccount::create($data);
    }

    public function update(int $id, array $data): ?OrgAccount
    {
        $account = OrgAccount::findOrFail($id);
        $account->update($data);
        return $account->fresh();
    }

    public function delete(int $id): bool
    {
        return OrgAccount::findOrFail($id)->delete();
    }

    public function countByOrganization(int $organizationId): int
    {
        return OrgAccount::where('organization_id', $organizationId)->count();
    }
}
