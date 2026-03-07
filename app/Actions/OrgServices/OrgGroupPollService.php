<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgGroupPollRepository;
use App\Repositories\OrgRepositories\OrgGroupRepository;

class OrgGroupPollService
{
    public function __construct(
        private OrgGroupPollRepository $pollRepo,
        private OrgGroupRepository $groupRepo,
    ) {}

    public function getPolls(int $groupId)
    {
        return $this->pollRepo->getByGroup($groupId);
    }

    public function getPoll(int $pollId)
    {
        return $this->pollRepo->findById($pollId);
    }

    public function createPoll(int $groupId, int $createdBy, array $data)
    {
        $group = $this->groupRepo->findById($groupId);
        if (!$group) return null;

        $poll = $this->pollRepo->create([
            'org_group_id' => $groupId,
            'created_by' => $createdBy,
            'question' => $data['question'],
            'description' => $data['description'] ?? null,
            'poll_type' => $data['poll_type'] ?? 'single',
            'is_anonymous' => $data['is_anonymous'] ?? false,
            'show_results_before_vote' => $data['show_results_before_vote'] ?? true,
            'expires_at' => $data['expires_at'] ?? null,
        ]);

        // Create options
        foreach ($data['options'] as $i => $label) {
            if (trim($label)) {
                $this->pollRepo->createOption([
                    'org_group_poll_id' => $poll->id,
                    'label' => trim($label),
                    'sort_order' => $i,
                ]);
            }
        }

        return $this->pollRepo->findById($poll->id);
    }

    public function vote(int $pollId, int $userId, array $optionIds): string|bool
    {
        $poll = $this->pollRepo->findById($pollId);
        if (!$poll) return false;
        if ($poll->isClosed()) return 'poll_closed';

        // For single-choice: remove existing votes first, then cast new one
        if ($poll->poll_type === 'single') {
            $this->pollRepo->removeAllUserVotes($pollId, $userId);
            if (count($optionIds) > 0) {
                $this->pollRepo->vote($pollId, $optionIds[0], $userId);
            }
        } else {
            // Multiple choice: toggle each option
            $currentVotes = $this->pollRepo->getUserVotes($pollId, $userId);
            foreach ($optionIds as $optionId) {
                if ($currentVotes->contains($optionId)) {
                    $this->pollRepo->removeVote($pollId, $optionId, $userId);
                } else {
                    $this->pollRepo->vote($pollId, $optionId, $userId);
                }
            }
        }

        return true;
    }

    public function closePoll(int $pollId, int $closedBy): bool
    {
        $result = $this->pollRepo->closePoll($pollId, $closedBy);
        return $result !== null;
    }

    public function deletePoll(int $pollId, int $groupId): bool
    {
        $poll = $this->pollRepo->findById($pollId);
        if (!$poll || $poll->org_group_id !== $groupId) return false;
        return $this->pollRepo->delete($pollId);
    }

    public function getVoters(int $pollId, ?int $optionId = null)
    {
        return $this->pollRepo->getVoters($pollId, $optionId);
    }

    public function getUserVotes(int $pollId, int $userId)
    {
        return $this->pollRepo->getUserVotes($pollId, $userId);
    }

    public function getTotalVoters(int $pollId): int
    {
        return $this->pollRepo->getTotalVoters($pollId);
    }
}
