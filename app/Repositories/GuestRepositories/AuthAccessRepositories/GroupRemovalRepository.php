<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\GroupMemberRemoval;
use App\Models\GuestModels\GroupRemovalVote;
use App\Models\GuestModels\ClassSetMember;
use Illuminate\Support\Collection;

class GroupRemovalRepository
{
    /**
     * Create a new removal request
     */
    public function createRemoval(int $classSetId, int $targetUserId, int $initiatedBy, $expiresAt): GroupMemberRemoval
    {
        return GroupMemberRemoval::create([
            'class_set_id' => $classSetId,
            'target_user_id' => $targetUserId,
            'initiated_by' => $initiatedBy,
            'status' => 'pending',
            'expires_at' => $expiresAt,
        ]);
    }

    /**
     * Get the pending removal for a class set (only one at a time)
     */
    public function getPendingRemoval(int $classSetId): ?GroupMemberRemoval
    {
        return GroupMemberRemoval::where('class_set_id', $classSetId)
            ->where('status', 'pending')
            ->with(['targetUser:id,uuid,first_name,last_name,username,profile_image', 'initiator:id,uuid,first_name,last_name,username,profile_image', 'votes.adminUser:id,uuid,first_name,last_name,username'])
            ->first();
    }

    /**
     * Get the pending removal for a specific user in a class set
     */
    public function getPendingRemovalForUser(int $classSetId, int $userId): ?GroupMemberRemoval
    {
        return GroupMemberRemoval::where('class_set_id', $classSetId)
            ->where('target_user_id', $userId)
            ->where('status', 'pending')
            ->first();
    }

    /**
     * Add a vote on a removal
     */
    public function addRemovalVote(int $removalId, int $adminUserId, string $vote): GroupRemovalVote
    {
        return GroupRemovalVote::create([
            'removal_id' => $removalId,
            'admin_user_id' => $adminUserId,
            'vote' => $vote,
        ]);
    }

    /**
     * Get all votes for a removal
     */
    public function getRemovalVotes(int $removalId): Collection
    {
        return GroupRemovalVote::where('removal_id', $removalId)
            ->with('adminUser:id,uuid,first_name,last_name,username')
            ->get();
    }

    /**
     * Check if an admin has already voted on a removal
     */
    public function hasVotedOnRemoval(int $removalId, int $adminUserId): bool
    {
        return GroupRemovalVote::where('removal_id', $removalId)
            ->where('admin_user_id', $adminUserId)
            ->exists();
    }

    /**
     * Update the status of a removal
     */
    public function updateRemovalStatus(int $removalId, string $status): void
    {
        GroupMemberRemoval::where('id', $removalId)->update(['status' => $status]);
    }

    /**
     * Get all expired pending removals
     */
    public function getExpiredPendingRemovals(): Collection
    {
        return GroupMemberRemoval::where('status', 'pending')
            ->where('expires_at', '<=', now())
            ->get();
    }

    /**
     * Set mute status for a member
     */
    public function setMuteStatus(int $classSetId, int $userId, bool $isMuted): void
    {
        ClassSetMember::where('class_set_id', $classSetId)
            ->where('user_id', $userId)
            ->update(['is_muted' => $isMuted]);
    }

    /**
     * Find a removal by ID
     */
    public function find(int $id): ?GroupMemberRemoval
    {
        return GroupMemberRemoval::with(['targetUser:id,uuid,first_name,last_name,username,profile_image', 'initiator:id,uuid,first_name,last_name,username,profile_image', 'votes.adminUser:id,uuid,first_name,last_name,username'])
            ->find($id);
    }
}
