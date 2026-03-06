<?php

namespace App\Repositories\AdminRepositories;

use App\Models\AdminModels\UsernameClaimRequest;

class UsernameClaimRequestRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1, string $search = '', string $status = '')
    {
        $query = UsernameClaimRequest::query()->latest();

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('username', 'like', "%{$search}%")
                  ->orWhere('full_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?UsernameClaimRequest
    {
        return UsernameClaimRequest::find($id);
    }

    public function update(int $id, array $data): ?UsernameClaimRequest
    {
        $request = $this->find($id);
        if ($request) {
            $request->update($data);
            return $request->fresh();
        }
        return null;
    }

    public function delete(int $id): bool
    {
        $request = $this->find($id);
        return $request ? $request->delete() : false;
    }

    public function count(): int
    {
        return UsernameClaimRequest::count();
    }

    public function countByStatus(string $status): int
    {
        return UsernameClaimRequest::where('status', $status)->count();
    }
}
