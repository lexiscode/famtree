<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminModels\Admin;

class TeamRepository
{
    public function getAll()
    {
        return Admin::latest()->get();
    }

    public function find(int $id): ?Admin
    {
        return Admin::find($id);
    }

    public function create(array $data): Admin
    {
        return Admin::create($data);
    }

    public function update(int $id, array $data): ?Admin
    {
        $admin = Admin::find($id);
        if ($admin) {
            $admin->update($data);
        }
        return $admin;
    }

    public function count(): int
    {
        return Admin::count();
    }

    public function countActive(): int
    {
        return Admin::where('is_active', true)->count();
    }
}
