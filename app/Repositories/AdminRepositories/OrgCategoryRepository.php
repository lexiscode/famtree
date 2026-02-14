<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\OrganizationCategory;
use Illuminate\Database\Eloquent\Collection;

class OrgCategoryRepository
{
    public function getAll(): Collection
    {
        return OrganizationCategory::withCount('organizations')
            ->ordered()
            ->get();
    }

    public function find(int $id): ?OrganizationCategory
    {
        return OrganizationCategory::withCount('organizations')->find($id);
    }

    public function create(array $data): OrganizationCategory
    {
        return OrganizationCategory::create($data);
    }

    public function update(int $id, array $data): ?OrganizationCategory
    {
        $category = OrganizationCategory::find($id);
        if ($category) {
            $category->update($data);
        }
        return $category;
    }

    public function delete(int $id): bool
    {
        $category = OrganizationCategory::find($id);
        return $category ? $category->delete() : false;
    }
}
