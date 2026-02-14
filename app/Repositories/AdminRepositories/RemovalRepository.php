<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\GroupMemberRemoval;
use App\Models\GuestModels\ClassSetMember;
use Illuminate\Pagination\LengthAwarePaginator;

class RemovalRepository
{
    public function getAllPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return GroupMemberRemoval::with([
            'classSet:id,uuid,name',
            'targetUser:id,first_name,last_name,username',
            'initiator:id,first_name,last_name,username',
        ])
            ->withCount('votes')
            ->latest('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function find(int $id): ?GroupMemberRemoval
    {
        return GroupMemberRemoval::with([
            'classSet:id,uuid,name',
            'targetUser:id,first_name,last_name,username',
            'initiator:id,first_name,last_name,username',
            'votes.adminUser:id,first_name,last_name,username',
        ])
            ->withCount('votes')
            ->find($id);
    }

    public function cancel(int $id): bool
    {
        $removal = GroupMemberRemoval::find($id);
        if (!$removal) return false;
        $removal->update(['status' => 'cancelled']);
        return true;
    }

    public function execute(int $id): bool
    {
        $removal = GroupMemberRemoval::find($id);
        if (!$removal) return false;
        $removal->update(['status' => 'completed']);
        ClassSetMember::where('class_set_id', $removal->class_set_id)
            ->where('user_id', $removal->target_user_id)
            ->delete();
        return true;
    }

    public function count(): int
    {
        return GroupMemberRemoval::count();
    }

    public function countPending(): int
    {
        return GroupMemberRemoval::where('status', 'pending')->count();
    }
}
