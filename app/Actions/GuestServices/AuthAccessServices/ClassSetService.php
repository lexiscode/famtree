<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Actions\GuestServices\OrganizationFollowService;
use App\Actions\GuestServices\AuthAccessServices\GroupElectionService;
use Illuminate\Validation\ValidationException;

class ClassSetService
{
    public function __construct(
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $messageRepository,
        private OrganizationFollowService $organizationFollowService,
        private GroupElectionService $electionService
    ) {
    }

    /**
     * Join a class set
     */
    public function joinClassSet(string $classSetUuid, int $userId): array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            throw ValidationException::withMessages([
                'class_set' => ['Class set not found.'],
            ]);
        }

        if (!$classSet->is_active) {
            throw ValidationException::withMessages([
                'class_set' => ['This class set is no longer active.'],
            ]);
        }

        if ($this->classSetRepository->isMember($classSet->id, $userId)) {
            throw ValidationException::withMessages([
                'class_set' => ['You are already a member of this class set.'],
            ]);
        }

        $member = $this->classSetRepository->addMember($classSet->id, $userId);

        // Auto-follow the parent organization
        try {
            $organization = $classSet->department->faculty->organization ?? null;
            if ($organization) {
                $this->organizationFollowService->followOrganization($userId, $organization->id);
            }
        } catch (\Throwable $e) {
            // Fire-and-forget: don't let follow failure block joining
        }

        // Check if member count just hit 20 → trigger initial election
        try {
            $this->electionService->triggerInitialElection($classSet->id);
        } catch (\Throwable $e) {
            // Fire-and-forget: don't let election trigger failure block joining
        }

        return [
            'success' => true,
            'message' => 'Successfully joined ' . $classSet->name,
            'member' => $member,
            'class_set' => $classSet,
        ];
    }

    /**
     * Leave a class set
     */
    public function leaveClassSet(string $classSetUuid, int $userId): array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            throw ValidationException::withMessages([
                'class_set' => ['Class set not found.'],
            ]);
        }

        if (!$this->classSetRepository->isMember($classSet->id, $userId)) {
            throw ValidationException::withMessages([
                'class_set' => ['You are not a member of this class set.'],
            ]);
        }

        // Check if user was admin before removal
        try {
            $this->electionService->handleAdminLeft($classSet->id, $userId);
        } catch (\Throwable $e) {
            // Fire-and-forget
        }

        $this->classSetRepository->removeMember($classSet->id, $userId);

        return [
            'success' => true,
            'message' => 'Successfully left ' . $classSet->name,
        ];
    }

    /**
     * Get all class sets for a user
     */
    public function getUserClassSets(int $userId): array
    {
        $classSets = $this->classSetRepository->getUserClassSets($userId);

        // Add latest message to each class set
        return $classSets->map(function ($classSet) {
            $latestMessage = $this->messageRepository->getLatestMessage($classSet->id);
            return [
                'id' => $classSet->id,
                'uuid' => $classSet->uuid,
                'name' => $classSet->name,
                'year' => $classSet->year,
                'members_count' => $classSet->members_count,
                'department' => $classSet->department->name,
                'faculty' => $classSet->department->faculty->name,
                'organization' => [
                    'name' => $classSet->department->faculty->organization->name,
                    'short_name' => $classSet->department->faculty->organization->short_name,
                    'logo' => $classSet->department->faculty->organization->logo_url,
                ],
                'latest_message' => $latestMessage ? [
                    'message' => $latestMessage->message,
                    'sender_name' => $latestMessage->is_org_broadcast
                        ? ($latestMessage->organization->short_name ?? $latestMessage->organization->name ?? 'Organization')
                        : ($latestMessage->sender ? $latestMessage->sender->first_name . ' ' . $latestMessage->sender->last_name : 'Unknown'),
                    'is_org_broadcast' => (bool) $latestMessage->is_org_broadcast,
                    'created_at' => $latestMessage->created_at,
                ] : null,
            ];
        })->toArray();
    }

    /**
     * Get class set details with membership status
     */
    public function getClassSetDetails(string $uuid, int $userId): ?array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($uuid);

        if (!$classSet) {
            return null;
        }

        $isMember = $this->classSetRepository->isMember($classSet->id, $userId);
        $membership = $isMember ? $this->classSetRepository->getMembership($classSet->id, $userId) : null;

        return [
            'class_set' => [
                'id' => $classSet->id,
                'uuid' => $classSet->uuid,
                'name' => $classSet->name,
                'year' => $classSet->year,
                'is_active' => $classSet->is_active,
            ],
            'department' => $classSet->department,
            'faculty' => $classSet->department->faculty,
            'organization' => $classSet->department->faculty->organization,
            'is_member' => $isMember,
            'is_admin' => $membership?->is_admin ?? false,
            'joined_at' => $membership?->joined_at,
            'member_count' => $this->classSetRepository->getMemberCount($classSet->id),
        ];
    }

    /**
     * Get members of a class set
     */
    public function getClassSetMembers(string $uuid, int $userId, int $limit = 50): ?array
    {
        $classSet = $this->classSetRepository->getClassSetByUuid($uuid);

        if (!$classSet) {
            return null;
        }

        // Only members can view the member list
        if (!$this->classSetRepository->isMember($classSet->id, $userId)) {
            throw ValidationException::withMessages([
                'class_set' => ['You must be a member to view the member list.'],
            ]);
        }

        $members = $this->classSetRepository->getClassSetMembers($classSet->id, $limit);

        return [
            'class_set' => $classSet,
            'members' => $members->map(function ($member) {
                return [
                    'id' => $member->user->id,
                    'uuid' => $member->user->uuid,
                    'first_name' => $member->user->first_name,
                    'last_name' => $member->user->last_name,
                    'username' => $member->user->username,
                    'profile_image' => $member->user->profile_image_url,
                    'is_admin' => $member->is_admin,
                    'joined_at' => $member->joined_at,
                ];
            }),
            'total_count' => $this->classSetRepository->getMemberCount($classSet->id),
        ];
    }
}
