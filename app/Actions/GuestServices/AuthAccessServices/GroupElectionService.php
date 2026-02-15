<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\GroupElectionRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use Illuminate\Validation\ValidationException;

class GroupElectionService
{
    public function __construct(
        private GroupElectionRepository $electionRepository,
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $messageRepository
    ) {
    }

    /**
     * Trigger the initial election when a group reaches 20 members
     */
    public function triggerInitialElection(int $classSetId): void
    {
        // Check no active election exists
        if ($this->electionRepository->getActiveElection($classSetId)) {
            return;
        }

        // Check member count >= 20
        $memberCount = $this->classSetRepository->getMemberCount($classSetId);
        if ($memberCount < 20) {
            return;
        }

        // Check no admins already set
        $adminCount = $this->electionRepository->getAdminCount($classSetId);
        if ($adminCount > 0) {
            return;
        }

        // Create election (type=initial, positions=3, ends_at=now+48h)
        $election = $this->electionRepository->createElection(
            $classSetId,
            'initial',
            3,
            now()->addHours(48)
        );

        // Add ALL current members as candidates
        $members = $this->classSetRepository->getClassSetMembers($classSetId, 1000);
        $userIds = $members->pluck('user_id')->toArray();
        $this->electionRepository->addCandidates($election->id, $userIds);

        // Create system message announcing the election
        $this->createSystemMessage(
            $classSetId,
            '🗳️ Group Admin Election has started! This group now has ' . $memberCount . ' members. Vote for 3 admins to help moderate this group. Voting ends in 48 hours.'
        );
    }

    /**
     * Trigger a replacement election when an admin leaves
     */
    public function triggerReplacementElection(int $classSetId): void
    {
        // Check no active election exists
        if ($this->electionRepository->getActiveElection($classSetId)) {
            return;
        }

        // Get top 20 most active chatters (last 30 days)
        $topChatters = $this->electionRepository->getTopActiveChatters($classSetId, 20, 30);

        if ($topChatters->isEmpty()) {
            // Fallback: use all members
            $members = $this->classSetRepository->getClassSetMembers($classSetId, 1000);
            $candidateIds = $members->pluck('user_id')->toArray();
        } else {
            $candidateIds = $topChatters->toArray();
        }

        // Exclude current admins from candidates
        $members = $this->classSetRepository->getClassSetMembers($classSetId, 1000);
        $adminIds = $members->where('is_admin', true)->pluck('user_id')->toArray();
        $candidateIds = array_values(array_diff($candidateIds, $adminIds));

        if (empty($candidateIds)) {
            return;
        }

        $election = $this->electionRepository->createElection(
            $classSetId,
            'replacement',
            1,
            now()->addHours(48)
        );

        $this->electionRepository->addCandidates($election->id, $candidateIds);

        $this->createSystemMessage(
            $classSetId,
            '🗳️ A replacement admin election has started! One admin position needs to be filled. Vote for your preferred candidate. Voting ends in 48 hours.'
        );
    }

    /**
     * Cast a vote in an election
     */
    public function castVote(int $electionId, int $voterId, int $candidateId): array
    {
        $election = $this->electionRepository->find($electionId);

        if (!$election || !$election->isActive()) {
            throw ValidationException::withMessages([
                'election' => ['This election is no longer active.'],
            ]);
        }

        if ($election->hasEnded()) {
            throw ValidationException::withMessages([
                'election' => ['Voting has ended for this election.'],
            ]);
        }

        // Validate voter is a member
        if (!$this->classSetRepository->isMember($election->class_set_id, $voterId)) {
            throw ValidationException::withMessages([
                'election' => ['You must be a group member to vote.'],
            ]);
        }

        // Check if already voted
        if ($this->electionRepository->hasVoted($electionId, $voterId)) {
            throw ValidationException::withMessages([
                'election' => ['You have already voted in this election.'],
            ]);
        }

        // Validate candidate is valid
        if (!$this->electionRepository->isCandidate($electionId, $candidateId)) {
            throw ValidationException::withMessages([
                'election' => ['Invalid candidate.'],
            ]);
        }

        $this->electionRepository->castVote($electionId, $voterId, $candidateId);

        // Return updated results
        $candidates = $this->electionRepository->getElectionResults($electionId);

        return [
            'success' => true,
            'candidates' => $candidates->map(fn($c) => [
                'user_id' => $c->user_id,
                'first_name' => $c->user->first_name,
                'last_name' => $c->user->last_name,
                'username' => $c->user->username,
                'profile_image' => $c->user->profile_image_url,
                'votes_count' => $c->votes_count,
            ])->toArray(),
        ];
    }

    /**
     * Process all ended elections (called by scheduler)
     */
    public function processEndedElections(): int
    {
        $endedElections = $this->electionRepository->getEndedActiveElections();
        $processed = 0;

        foreach ($endedElections as $election) {
            $this->processElection($election);
            $processed++;
        }

        return $processed;
    }

    /**
     * Process a single ended election
     */
    private function processElection($election): void
    {
        $results = $this->electionRepository->getElectionResults($election->id);

        if ($results->isEmpty()) {
            $this->electionRepository->cancelElection($election->id);
            return;
        }

        $positionsToFill = $election->positions_to_fill;

        // Check for ties at the cutoff position
        if ($results->count() > $positionsToFill) {
            $lastWinnerVotes = $results[$positionsToFill - 1]->votes_count;
            $firstLoserVotes = $results[$positionsToFill]->votes_count;

            if ($lastWinnerVotes > 0 && $lastWinnerVotes === $firstLoserVotes) {
                // There's a tie — create a tiebreaker election
                $tiedCandidates = $results->filter(fn($c) => $c->votes_count === $lastWinnerVotes);

                // First, set the clear winners as admins (those above the tie)
                $clearWinners = $results->take($positionsToFill)->filter(fn($c) => $c->votes_count > $lastWinnerVotes);
                foreach ($clearWinners as $winner) {
                    $this->classSetRepository->updateAdminStatus($election->class_set_id, $winner->user_id, true);
                }

                $remainingPositions = $positionsToFill - $clearWinners->count();

                // Create tiebreaker election
                $tiebreakerElection = $this->electionRepository->createElection(
                    $election->class_set_id,
                    'tiebreaker',
                    $remainingPositions,
                    now()->addHours(24),
                    $election->id
                );

                $this->electionRepository->addCandidates(
                    $tiebreakerElection->id,
                    $tiedCandidates->pluck('user_id')->toArray()
                );

                $this->electionRepository->completeElection($election->id);

                $this->createSystemMessage(
                    $election->class_set_id,
                    '🗳️ There was a tie! A tiebreaker election has started with ' . $tiedCandidates->count() . ' candidates for ' . $remainingPositions . ' position(s). Voting ends in 24 hours.'
                );

                return;
            }
        }

        // No tie — set winners as admins
        $winners = $results->take($positionsToFill)->filter(fn($c) => $c->votes_count > 0);

        if ($winners->isEmpty()) {
            // No one received any votes
            $this->electionRepository->completeElection($election->id);
            $this->createSystemMessage(
                $election->class_set_id,
                '🗳️ The election has ended with no votes cast. No admins were appointed.'
            );
            return;
        }

        $winnerNames = [];
        foreach ($winners as $winner) {
            $this->classSetRepository->updateAdminStatus($election->class_set_id, $winner->user_id, true);
            $winnerNames[] = $winner->user->first_name . ' ' . $winner->user->last_name;
        }

        $this->electionRepository->completeElection($election->id);

        $this->createSystemMessage(
            $election->class_set_id,
            '🗳️ Election results are in! New admin(s): ' . implode(', ', $winnerNames) . '. Congratulations!'
        );
    }

    /**
     * Handle when an admin leaves the group
     */
    public function handleAdminLeft(int $classSetId, int $userId): void
    {
        // Check if the member was an admin
        $membership = $this->classSetRepository->getMembership($classSetId, $userId);
        if (!$membership || !$membership->is_admin) {
            return;
        }

        // Check remaining admin count (after removal)
        $adminCount = $this->electionRepository->getAdminCount($classSetId) - 1; // -1 because they haven't been removed yet

        $memberCount = $this->classSetRepository->getMemberCount($classSetId);

        if ($adminCount < 3 && $memberCount >= 20) {
            // Trigger replacement election after the member is actually removed
            // Use a deferred call to allow the removal to complete first
            app()->terminating(function () use ($classSetId) {
                $this->triggerReplacementElection($classSetId);
            });
        }
    }

    /**
     * Get election status for a class set
     */
    public function getElectionStatus(int $classSetId, int $userId): ?array
    {
        $election = $this->electionRepository->getActiveElection($classSetId);

        if (!$election) {
            return null;
        }

        $candidates = $this->electionRepository->getElectionResults($election->id);
        $hasVoted = $this->electionRepository->hasVoted($election->id, $userId);

        return [
            'id' => $election->id,
            'type' => $election->type,
            'status' => $election->status,
            'positions_to_fill' => $election->positions_to_fill,
            'ends_at' => $election->ends_at->toISOString(),
            'started_at' => $election->started_at->toISOString(),
            'has_voted' => $hasVoted,
            'candidates' => $candidates->map(fn($c) => [
                'user_id' => $c->user_id,
                'first_name' => $c->user->first_name,
                'last_name' => $c->user->last_name,
                'username' => $c->user->username,
                'profile_image' => $c->user->profile_image_url,
                'votes_count' => $c->votes_count,
            ])->toArray(),
            'total_votes' => $election->votes->count(),
        ];
    }

    /**
     * Create a system message in a class set chat
     */
    private function createSystemMessage(int $classSetId, string $message): void
    {
        $this->messageRepository->createMessage($classSetId, null, $message);
    }
}
