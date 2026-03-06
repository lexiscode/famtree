<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminModels\ReservedUsername;
use Illuminate\Pagination\LengthAwarePaginator;

class ReservedUsernameRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1, string $search = '', string $status = ''): LengthAwarePaginator
    {
        $query = ReservedUsername::with('claimedByUser')->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('celebrity_name', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?ReservedUsername
    {
        return ReservedUsername::with('claimedByUser')->find($id);
    }

    public function findByUsername(string $username): ?ReservedUsername
    {
        return ReservedUsername::where('username', strtolower($username))->first();
    }

    public function isReserved(string $username): bool
    {
        return ReservedUsername::where('username', strtolower($username))
            ->where('status', 'reserved')
            ->exists();
    }

    public function create(array $data): ReservedUsername
    {
        $data['username'] = strtolower($data['username']);
        return ReservedUsername::create($data);
    }

    public function update(int $id, array $data): ?ReservedUsername
    {
        $reserved = ReservedUsername::find($id);
        if ($reserved) {
            if (isset($data['username'])) {
                $data['username'] = strtolower($data['username']);
            }
            $reserved->update($data);
        }
        return $reserved;
    }

    public function delete(int $id): bool
    {
        $reserved = ReservedUsername::find($id);
        return $reserved ? $reserved->delete() : false;
    }

    public function count(): int
    {
        return ReservedUsername::count();
    }

    public function countByStatus(string $status): int
    {
        return ReservedUsername::where('status', $status)->count();
    }
}
