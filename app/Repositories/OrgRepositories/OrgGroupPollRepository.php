<?php

namespace App\Repositories\OrgRepositories;

use App\Models\OrgModels\OrgGroupPoll;
use App\Models\OrgModels\OrgGroupPollOption;
use App\Models\OrgModels\OrgGroupPollVote;
use Illuminate\Support\Collection;

class OrgGroupPollRepository
{
    public function getByGroup(int $groupId): Collection
    {
        return OrgGroupPoll::where('org_group_id', $groupId)
            ->with([
                'creator:id,uuid,first_name,last_name,username,profile_image',
                'options' => function ($q) {
                    $q->withCount('votes')->orderBy('sort_order');
                },
            ])
            ->withCount('votes')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function findById(int $id): ?OrgGroupPoll
    {
        return OrgGroupPoll::with([
            'creator:id,uuid,first_name,last_name,username,profile_image',
            'options' => function ($q) {
                $q->withCount('votes')->orderBy('sort_order');
            },
        ])->withCount('votes')->find($id);
    }

    public function create(array $data): OrgGroupPoll
    {
        return OrgGroupPoll::create($data);
    }

    public function createOption(array $data): OrgGroupPollOption
    {
        return OrgGroupPollOption::create($data);
    }

    public function closePoll(int $pollId, int $closedBy): ?OrgGroupPoll
    {
        $poll = OrgGroupPoll::find($pollId);
        if (!$poll) return null;
        $poll->update([
            'is_active' => false,
            'closed_at' => now(),
            'closed_by' => $closedBy,
        ]);
        return $poll->fresh();
    }

    public function delete(int $pollId): bool
    {
        $poll = OrgGroupPoll::find($pollId);
        if (!$poll) return false;
        return $poll->delete();
    }

    public function vote(int $pollId, int $optionId, int $userId): ?OrgGroupPollVote
    {
        $existing = OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->where('org_group_poll_option_id', $optionId)
            ->where('user_id', $userId)
            ->first();

        if ($existing) return null; // Already voted for this option

        return OrgGroupPollVote::create([
            'org_group_poll_id' => $pollId,
            'org_group_poll_option_id' => $optionId,
            'user_id' => $userId,
        ]);
    }

    public function removeVote(int $pollId, int $optionId, int $userId): bool
    {
        return OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->where('org_group_poll_option_id', $optionId)
            ->where('user_id', $userId)
            ->delete() > 0;
    }

    public function getUserVotes(int $pollId, int $userId): Collection
    {
        return OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->where('user_id', $userId)
            ->pluck('org_group_poll_option_id');
    }

    public function getVoters(int $pollId, ?int $optionId = null): Collection
    {
        $query = OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->with('user:id,uuid,first_name,last_name,username,profile_image');

        if ($optionId) {
            $query->where('org_group_poll_option_id', $optionId);
        }

        return $query->get();
    }

    public function getTotalVoters(int $pollId): int
    {
        return OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->distinct('user_id')
            ->count('user_id');
    }

    public function removeAllUserVotes(int $pollId, int $userId): int
    {
        return OrgGroupPollVote::where('org_group_poll_id', $pollId)
            ->where('user_id', $userId)
            ->delete();
    }
}
