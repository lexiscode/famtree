<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgGroupPollService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class OrgGroupPollController extends Controller
{
    public function __construct(private OrgGroupPollService $pollService) {}

    private function getAccessScope(): bool|int
    {
        $orgAccount = Auth::guard('org')->user();
        if (Gate::allows('manage-org-groups')) return true;
        if ($orgAccount->linked_org_group_id) return $orgAccount->linked_org_group_id;
        abort(403);
    }

    private function canAccessGroup(int $groupId): bool
    {
        $scope = $this->getAccessScope();
        return $scope === true || $scope === $groupId;
    }

    /**
     * List polls for a group.
     */
    public function index(int $groupId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $polls = $this->pollService->getPolls($groupId);

        return response()->json($polls->map(function ($poll) use ($userId) {
            return $this->formatPoll($poll, $userId);
        }));
    }

    /**
     * Create a new poll.
     */
    public function store(Request $request, int $groupId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $request->validate([
            'question' => 'required|string|max:500',
            'description' => 'nullable|string|max:2000',
            'poll_type' => 'required|in:single,multiple',
            'is_anonymous' => 'boolean',
            'show_results_before_vote' => 'boolean',
            'options' => 'required|array|min:2|max:10',
            'options.*' => 'required|string|max:200',
            'expires_at' => 'nullable|date|after:now',
        ]);

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $poll = $this->pollService->createPoll($groupId, $userId, $request->all());

        if (!$poll) {
            return redirect()->back()->with('error', 'Group not found.');
        }

        return response()->json($this->formatPoll($poll, $userId));
    }

    /**
     * Vote on a poll.
     */
    public function vote(Request $request, int $groupId, int $pollId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $request->validate([
            'option_ids' => 'required|array|min:1',
            'option_ids.*' => 'integer|exists:org_group_poll_options,id',
        ]);

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $result = $this->pollService->vote($pollId, $userId, $request->input('option_ids'));

        if ($result === false) {
            return response()->json(['error' => 'Poll not found.'], 404);
        }
        if ($result === 'poll_closed') {
            return response()->json(['error' => 'This poll is closed.'], 422);
        }

        // Return updated poll data
        $poll = $this->pollService->getPoll($pollId);
        return response()->json($this->formatPoll($poll, $userId));
    }

    /**
     * Close a poll.
     */
    public function close(int $groupId, int $pollId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $orgAccount = Auth::guard('org')->user();
        $userId = $orgAccount->user_id ?? $orgAccount->id;

        $result = $this->pollService->closePoll($pollId, $userId);

        if (!$result) {
            return response()->json(['error' => 'Poll not found.'], 404);
        }

        $poll = $this->pollService->getPoll($pollId);
        return response()->json($this->formatPoll($poll, $userId));
    }

    /**
     * Delete a poll.
     */
    public function destroy(int $groupId, int $pollId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $result = $this->pollService->deletePoll($pollId, $groupId);

        if (!$result) {
            return response()->json(['error' => 'Poll not found.'], 404);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Get voters for a poll (or specific option).
     */
    public function voters(Request $request, int $groupId, int $pollId)
    {
        if (!$this->canAccessGroup($groupId)) abort(403);

        $poll = $this->pollService->getPoll($pollId);
        if (!$poll) return response()->json(['error' => 'Poll not found.'], 404);

        if ($poll->is_anonymous) {
            return response()->json(['error' => 'This poll is anonymous.'], 403);
        }

        $optionId = $request->query('option_id') ? (int) $request->query('option_id') : null;
        $voters = $this->pollService->getVoters($pollId, $optionId);

        return response()->json($voters->map(fn($v) => [
            'id' => $v->user->id,
            'first_name' => $v->user->first_name,
            'last_name' => $v->user->last_name,
            'username' => $v->user->username,
            'profile_image' => $v->user->profile_image,
            'option_id' => $v->org_group_poll_option_id,
        ]));
    }

    private function formatPoll($poll, int $userId): array
    {
        $userVotes = $this->pollService->getUserVotes($poll->id, $userId);
        $totalVoters = $this->pollService->getTotalVoters($poll->id);
        $totalVoteCount = $poll->votes_count;

        return [
            'id' => $poll->id,
            'question' => $poll->question,
            'description' => $poll->description,
            'poll_type' => $poll->poll_type,
            'is_anonymous' => $poll->is_anonymous,
            'show_results_before_vote' => $poll->show_results_before_vote,
            'is_active' => $poll->is_active,
            'is_closed' => $poll->isClosed(),
            'is_expired' => $poll->isExpired(),
            'expires_at' => $poll->expires_at?->toISOString(),
            'closed_at' => $poll->closed_at?->toISOString(),
            'created_at' => $poll->created_at->toISOString(),
            'creator' => $poll->creator ? [
                'id' => $poll->creator->id,
                'first_name' => $poll->creator->first_name,
                'last_name' => $poll->creator->last_name,
                'username' => $poll->creator->username,
                'profile_image' => $poll->creator->profile_image,
            ] : null,
            'options' => $poll->options->map(fn($opt) => [
                'id' => $opt->id,
                'label' => $opt->label,
                'votes_count' => $opt->votes_count,
                'percentage' => $totalVoteCount > 0
                    ? round(($opt->votes_count / $totalVoteCount) * 100, 1)
                    : 0,
            ]),
            'total_votes' => $totalVoteCount,
            'total_voters' => $totalVoters,
            'user_votes' => $userVotes->values(),
            'has_voted' => $userVotes->isNotEmpty(),
        ];
    }
}
