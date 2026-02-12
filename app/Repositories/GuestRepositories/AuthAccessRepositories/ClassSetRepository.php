<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\ClassSet;
use App\Models\GuestModels\ClassSetMember;

class ClassSetRepository
{
    /**
     * Get class set by UUID with full chain loaded
     */
    public function getClassSetByUuid(string $uuid): ?ClassSet
    {
        return ClassSet::where('uuid', $uuid)
            ->with(['department.faculty.organization'])
            ->first();
    }

    /**
     * Get class set members with user info
     */
    public function getClassSetMembers(int $classSetId, int $limit = 50)
    {
        return ClassSetMember::where('class_set_id', $classSetId)
            ->with(['user:id,uuid,first_name,last_name,username,profile_image'])
            ->orderBy('joined_at', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Add a member to a class set
     */
    public function addMember(int $classSetId, int $userId): ClassSetMember
    {
        return ClassSetMember::create([
            'class_set_id' => $classSetId,
            'user_id' => $userId,
            'joined_at' => now(),
            'is_admin' => false,
        ]);
    }

    /**
     * Remove a member from a class set
     */
    public function removeMember(int $classSetId, int $userId): bool
    {
        return ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    /**
     * Check if user is a member of a class set
     */
    public function isMember(int $classSetId, int $userId): bool
    {
        return ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Get all class sets a user belongs to
     */
    public function getUserClassSets(int $userId)
    {
        return ClassSet::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })
        ->with(['department.faculty.organization', 'members' => function ($query) {
            $query->latest('joined_at')->limit(5);
        }])
        ->withCount('members')
        ->get();
    }

    /**
     * Get user's membership record for a class set
     */
    public function getMembership(int $classSetId, int $userId): ?ClassSetMember
    {
        return ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Find class set by ID
     */
    public function find(int $id): ?ClassSet
    {
        return ClassSet::find($id);
    }

    /**
     * Get member count for a class set
     */
    public function getMemberCount(int $classSetId): int
    {
        return ClassSetMember::where('class_set_id', $classSetId)->count();
    }

    /**
     * Update member admin status
     */
    public function updateAdminStatus(int $classSetId, int $userId, bool $isAdmin): bool
    {
        return ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->update(['is_admin' => $isAdmin]) > 0;
    }

    /**
     * Check if two users share a common class set group
     */
    public function shareCommonGroup(int $userId1, int $userId2): bool
    {
        $user1ClassSetIds = ClassSetMember::where('user_id', $userId1)->pluck('class_set_id');

        return ClassSetMember::where('user_id', $userId2)
            ->whereIn('class_set_id', $user1ClassSetIds)
            ->exists();
    }
}
