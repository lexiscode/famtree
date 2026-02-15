<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\GroupRemovalRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use Illuminate\Validation\ValidationException;

class GroupRemovalService
{
    public function __construct(
        private GroupRemovalRepository $removalRepository,
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $messageRepository
    ) {
    }

    /**
     * Initiate a member removal process
     */
    public function initiateRemoval(int $classSetId, int $targetUserId, int $initiatorUserId): array
    {
        // Validate initiator is admin
        $initiatorMembership = $this->classSetRepository->getMembership($classSetId, $initiatorUserId);
        if (!$initiatorMembership || !$initiatorMembership->is_admin) {
            throw ValidationException::withMessages([
                'removal' => ['Only group admins can initiate member removal.'],
            ]);
        }

        // Validate target is a member
        if (!$this->classSetRepository->isMember($classSetId, $targetUserId)) {
            throw ValidationException::withMessages([
                'removal' => ['The target user is not a member of this group.'],
            ]);
        }

        // Validate target is NOT admin
        $targetMembership = $this->classSetRepository->getMembership($classSetId, $targetUserId);
        if ($targetMembership && $targetMembership->is_admin) {
            throw ValidationException::withMessages([
                'removal' => ['You cannot remove another admin. Admins must leave voluntarily.'],
            ]);
        }

        // Validate no other pending removal exists for this group
        $existingRemoval = $this->removalRepository->getPendingRemoval($classSetId);
        if ($existingRemoval) {
            throw ValidationException::withMessages([
                'removal' => ['There is already a pending removal in this group.'],
            ]);
        }

        // Create removal record (expires in 3 days)
        $removal = $this->removalRepository->createRemoval(
            $classSetId,
            $targetUserId,
            $initiatorUserId,
            now()->addDays(3)
        );

        // Set target's is_muted = true
        $this->removalRepository->setMuteStatus($classSetId, $targetUserId, true);

        // Auto-record initiator's vote as "confirm"
        $this->removalRepository->addRemovalVote($removal->id, $initiatorUserId, 'confirm');

        // Get target name for system message
        $targetUser = $targetMembership->user ?? \App\Models\GuestModels\User::find($targetUserId);
        $initiatorUser = $initiatorMembership->user ?? \App\Models\GuestModels\User::find($initiatorUserId);

        $targetName = $targetUser ? $targetUser->first_name . ' ' . $targetUser->last_name : 'A member';
        $initiatorName = $initiatorUser ? $initiatorUser->first_name . ' ' . $initiatorUser->last_name : 'An admin';

        // Create system message
        $this->messageRepository->createMessage(
            $classSetId,
            null,
            '⚠️ ' . $initiatorName . ' has initiated the removal of ' . $targetName . ' from this group. Other admins have 3 days to vote. 2 confirm votes are needed to remove.'
        );

        $removal->load(['targetUser:id,uuid,first_name,last_name,username,profile_image', 'initiator:id,uuid,first_name,last_name,username,profile_image', 'votes.adminUser:id,uuid,first_name,last_name,username']);

        return [
            'success' => true,
            'removal' => $this->formatRemoval($removal),
        ];
    }

    /**
     * Vote on a pending removal
     */
    public function voteOnRemoval(int $removalId, int $adminUserId, string $vote): array
    {
        $removal = $this->removalRepository->find($removalId);

        if (!$removal || !$removal->isPending()) {
            throw ValidationException::withMessages([
                'removal' => ['This removal is no longer pending.'],
            ]);
        }

        // Validate admin is group admin
        $membership = $this->classSetRepository->getMembership($removal->class_set_id, $adminUserId);
        if (!$membership || !$membership->is_admin) {
            throw ValidationException::withMessages([
                'removal' => ['Only group admins can vote on removals.'],
            ]);
        }

        // Validate is NOT the initiator
        if ($removal->initiated_by === $adminUserId) {
            throw ValidationException::withMessages([
                'removal' => ['The initiator cannot vote again.'],
            ]);
        }

        // Validate hasn't already voted
        if ($this->removalRepository->hasVotedOnRemoval($removalId, $adminUserId)) {
            throw ValidationException::withMessages([
                'removal' => ['You have already voted on this removal.'],
            ]);
        }

        // Validate vote value
        if (!in_array($vote, ['confirm', 'reject'])) {
            throw ValidationException::withMessages([
                'vote' => ['Vote must be either confirm or reject.'],
            ]);
        }

        // Record vote
        $this->removalRepository->addRemovalVote($removalId, $adminUserId, $vote);

        // Check results
        $votes = $this->removalRepository->getRemovalVotes($removalId);
        $confirmCount = $votes->where('vote', 'confirm')->count();
        $rejectCount = $votes->where('vote', 'reject')->count();

        if ($confirmCount >= 2) {
            $this->executeRemoval($removalId);
        } elseif ($rejectCount >= 2) {
            $this->cancelRemoval($removalId);
        }

        // Reload
        $removal = $this->removalRepository->find($removalId);

        return [
            'success' => true,
            'removal' => $this->formatRemoval($removal),
        ];
    }

    /**
     * Execute a removal (member is removed from group)
     */
    public function executeRemoval(int $removalId): void
    {
        $removal = $this->removalRepository->find($removalId);
        if (!$removal) {
            return;
        }

        // Remove target from class_set_members
        $this->classSetRepository->removeMember($removal->class_set_id, $removal->target_user_id);

        // Update removal status
        $this->removalRepository->updateRemovalStatus($removalId, 'confirmed');

        $targetName = $removal->targetUser
            ? $removal->targetUser->first_name . ' ' . $removal->targetUser->last_name
            : 'A member';

        $this->messageRepository->createMessage(
            $removal->class_set_id,
            null,
            '🚫 ' . $targetName . ' has been removed from this group by admin consensus.'
        );
    }

    /**
     * Cancel a removal
     */
    public function cancelRemoval(int $removalId): void
    {
        $removal = $this->removalRepository->find($removalId);
        if (!$removal) {
            return;
        }

        // Unmute the target
        $this->removalRepository->setMuteStatus($removal->class_set_id, $removal->target_user_id, false);

        // Update status
        $this->removalRepository->updateRemovalStatus($removalId, 'cancelled');

        $targetName = $removal->targetUser
            ? $removal->targetUser->first_name . ' ' . $removal->targetUser->last_name
            : 'A member';

        $this->messageRepository->createMessage(
            $removal->class_set_id,
            null,
            '✅ The removal of ' . $targetName . ' has been cancelled by admin vote.'
        );
    }

    /**
     * Process expired removals (called by scheduler)
     */
    public function processExpiredRemovals(): int
    {
        $expired = $this->removalRepository->getExpiredPendingRemovals();
        $processed = 0;

        foreach ($expired as $removal) {
            $this->executeRemoval($removal->id);
            $processed++;
        }

        return $processed;
    }

    /**
     * Get removal status for a class set
     */
    public function getRemovalStatus(int $classSetId, int $userId): ?array
    {
        $removal = $this->removalRepository->getPendingRemoval($classSetId);

        if (!$removal) {
            return null;
        }

        // Check if the current user is an admin
        $membership = $this->classSetRepository->getMembership($classSetId, $userId);
        $isAdmin = $membership && $membership->is_admin;
        $isTarget = $removal->target_user_id === $userId;
        $isInitiator = $removal->initiated_by === $userId;

        // Get admin list for DM links
        $admins = [];
        if ($isTarget) {
            $members = $this->classSetRepository->getClassSetMembers($classSetId, 1000);
            $admins = $members->where('is_admin', true)->map(fn($m) => [
                'id' => $m->user->id,
                'uuid' => $m->user->uuid,
                'first_name' => $m->user->first_name,
                'last_name' => $m->user->last_name,
                'username' => $m->user->username,
            ])->values()->toArray();
        }

        return [
            'id' => $removal->id,
            'status' => $removal->status,
            'expires_at' => $removal->expires_at->toISOString(),
            'is_admin' => $isAdmin,
            'is_target' => $isTarget,
            'is_initiator' => $isInitiator,
            'target_user' => [
                'id' => $removal->targetUser->id,
                'uuid' => $removal->targetUser->uuid,
                'first_name' => $removal->targetUser->first_name,
                'last_name' => $removal->targetUser->last_name,
                'username' => $removal->targetUser->username,
                'profile_image' => $removal->targetUser->profile_image_url,
            ],
            'initiator' => [
                'id' => $removal->initiator->id,
                'uuid' => $removal->initiator->uuid,
                'first_name' => $removal->initiator->first_name,
                'last_name' => $removal->initiator->last_name,
                'username' => $removal->initiator->username,
            ],
            'votes' => $removal->votes->map(fn($v) => [
                'admin_user_id' => $v->admin_user_id,
                'admin_name' => $v->adminUser->first_name . ' ' . $v->adminUser->last_name,
                'vote' => $v->vote,
            ])->toArray(),
            'has_voted' => $isAdmin ? $this->removalRepository->hasVotedOnRemoval($removal->id, $userId) : false,
            'admins' => $admins,
        ];
    }

    /**
     * Format removal data for API response
     */
    private function formatRemoval($removal): array
    {
        return [
            'id' => $removal->id,
            'status' => $removal->status,
            'expires_at' => $removal->expires_at->toISOString(),
            'target_user' => $removal->targetUser ? [
                'id' => $removal->targetUser->id,
                'uuid' => $removal->targetUser->uuid,
                'first_name' => $removal->targetUser->first_name,
                'last_name' => $removal->targetUser->last_name,
                'username' => $removal->targetUser->username,
                'profile_image' => $removal->targetUser->profile_image_url,
            ] : null,
            'initiator' => $removal->initiator ? [
                'id' => $removal->initiator->id,
                'first_name' => $removal->initiator->first_name,
                'last_name' => $removal->initiator->last_name,
            ] : null,
            'votes' => $removal->votes->map(fn($v) => [
                'admin_user_id' => $v->admin_user_id,
                'admin_name' => $v->adminUser->first_name . ' ' . $v->adminUser->last_name,
                'vote' => $v->vote,
            ])->toArray(),
        ];
    }
}
