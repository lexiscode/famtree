<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\FamilyTree;
use App\Models\GuestModels\FamilyTreeConnection;
use App\Models\GuestModels\UserConnection;
use Illuminate\Pagination\LengthAwarePaginator;

class FamilyTreeRepository
{
    /**
     * Get all family trees with pagination
     */
    public function getAllPaginated(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = FamilyTree::with('rootUser:id,first_name,last_name,username,email,profile_image')
            ->withCount(['members', 'admins']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('tree_name', 'like', "%{$search}%")
                    ->orWhereHas('rootUser', function ($uq) use ($search) {
                        $uq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
            });
        }

        if (isset($filters['is_public']) && $filters['is_public'] !== null) {
            $isPublic = $filters['is_public'] === 'true' || $filters['is_public'] === true;
            $query->where('is_public', $isPublic);
        }

        if (isset($filters['is_nuclear_family']) && $filters['is_nuclear_family'] !== null) {
            $isNuclear = $filters['is_nuclear_family'] === 'true' || $filters['is_nuclear_family'] === true;
            $query->where('is_nuclear_family', $isNuclear);
        }

        $sortBy = $filters['sortBy'] ?? 'created_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find a family tree by ID with relationships
     */
    public function find(int $id): ?FamilyTree
    {
        return FamilyTree::with([
            'rootUser:id,first_name,last_name,username,email,profile_image',
            'createdBy:id,first_name,last_name,username',
            'members.user:id,first_name,last_name,username,email,profile_image',
            'admins.user:id,first_name,last_name,username,email,profile_image',
        ])
        ->withCount(['members', 'admins'])
        ->find($id);
    }

    /**
     * Delete a family tree
     */
    public function delete(int $id): bool
    {
        $tree = FamilyTree::find($id);
        return $tree ? $tree->delete() : false;
    }

    /**
     * Toggle visibility of a family tree
     */
    public function toggleVisibility(int $id): ?FamilyTree
    {
        $tree = FamilyTree::find($id);
        if ($tree) {
            $tree->update(['is_public' => !$tree->is_public]);
        }
        return $tree;
    }

    /**
     * Count total family trees
     */
    public function count(): int
    {
        return FamilyTree::count();
    }

    /**
     * Count public family trees
     */
    public function countPublic(): int
    {
        return FamilyTree::where('is_public', true)->count();
    }

    /**
     * Count private family trees
     */
    public function countPrivate(): int
    {
        return FamilyTree::where('is_public', false)->count();
    }

    /**
     * Count total user connections
     */
    public function countUserConnections(): int
    {
        return UserConnection::count();
    }

    /**
     * Count user connections by status
     */
    public function countUserConnectionsByStatus(string $status): int
    {
        return UserConnection::where('status', $status)->count();
    }

    /**
     * Count family tree connections
     */
    public function countTreeConnections(): int
    {
        return FamilyTreeConnection::count();
    }

    /**
     * Count tree connections by status
     */
    public function countTreeConnectionsByStatus(string $status): int
    {
        return FamilyTreeConnection::where('status', $status)->count();
    }
}
