<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\GroupElection;
use App\Models\GuestModels\GroupElectionCandidate;
use App\Models\GuestModels\GroupElectionVote;
use App\Models\GuestModels\ClassSetMessage;
use Illuminate\Support\Collection;

class GroupElectionRepository
{
    /**
     * Create a new election
     */
    public function createElection(
        int $classSetId,
        string $type,
        int $positionsToFill,
        $endsAt,
        ?int $parentElectionId = null
    ): GroupElection {
        return GroupElection::create([
            'class_set_id' => $classSetId,
            'type' => $type,
            'status' => 'active',
            'positions_to_fill' => $positionsToFill,
            'parent_election_id' => $parentElectionId,
            'started_at' => now(),
            'ends_at' => $endsAt,
        ]);
    }

    /**
     * Get the active election for a class set
     */
    public function getActiveElection(int $classSetId): ?GroupElection
    {
        return GroupElection::where('class_set_id', $classSetId)
            ->where('status', 'active')
            ->with(['candidates.user:id,uuid,first_name,last_name,username,profile_image', 'votes'])
            ->first();
    }

    /**
     * Add a single candidate to an election
     */
    public function addCandidate(int $electionId, int $userId): GroupElectionCandidate
    {
        return GroupElectionCandidate::create([
            'election_id' => $electionId,
            'user_id' => $userId,
            'votes_count' => 0,
        ]);
    }

    /**
     * Add multiple candidates to an election
     */
    public function addCandidates(int $electionId, array $userIds): void
    {
        $records = array_map(fn($userId) => [
            'election_id' => $electionId,
            'user_id' => $userId,
            'votes_count' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ], $userIds);

        GroupElectionCandidate::insert($records);
    }

    /**
     * Cast a vote in an election
     */
    public function castVote(int $electionId, int $voterId, int $candidateId): GroupElectionVote
    {
        $vote = GroupElectionVote::create([
            'election_id' => $electionId,
            'voter_id' => $voterId,
            'candidate_id' => $candidateId,
        ]);

        // Increment the denormalized vote count
        GroupElectionCandidate::where('election_id', $electionId)
            ->where('user_id', $candidateId)
            ->increment('votes_count');

        return $vote;
    }

    /**
     * Check if a user has already voted in an election
     */
    public function hasVoted(int $electionId, int $voterId): bool
    {
        return GroupElectionVote::where('election_id', $electionId)
            ->where('voter_id', $voterId)
            ->exists();
    }

    /**
     * Get election results ordered by votes
     */
    public function getElectionResults(int $electionId): Collection
    {
        return GroupElectionCandidate::where('election_id', $electionId)
            ->with('user:id,uuid,first_name,last_name,username,profile_image')
            ->orderByDesc('votes_count')
            ->get();
    }

    /**
     * Mark an election as completed
     */
    public function completeElection(int $electionId): void
    {
        GroupElection::where('id', $electionId)->update(['status' => 'completed']);
    }

    /**
     * Cancel an election
     */
    public function cancelElection(int $electionId): void
    {
        GroupElection::where('id', $electionId)->update(['status' => 'cancelled']);
    }

    /**
     * Get all active elections that have passed their end time
     */
    public function getEndedActiveElections(): Collection
    {
        return GroupElection::where('status', 'active')
            ->where('ends_at', '<=', now())
            ->get();
    }

    /**
     * Get the most active chatters in a class set (by message count in last N days)
     */
    public function getTopActiveChatters(int $classSetId, int $limit = 20, int $days = 30): Collection
    {
        return ClassSetMessage::where('class_set_id', $classSetId)
            ->whereNotNull('sender_id')
            ->where('created_at', '>=', now()->subDays($days))
            ->selectRaw('sender_id, COUNT(*) as message_count')
            ->groupBy('sender_id')
            ->orderByDesc('message_count')
            ->limit($limit)
            ->pluck('sender_id');
    }

    /**
     * Find an election by ID
     */
    public function find(int $id): ?GroupElection
    {
        return GroupElection::with(['candidates.user:id,uuid,first_name,last_name,username,profile_image', 'votes'])
            ->find($id);
    }

    /**
     * Check if a user is a candidate in an election
     */
    public function isCandidate(int $electionId, int $userId): bool
    {
        return GroupElectionCandidate::where('election_id', $electionId)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Get the number of admins in a class set
     */
    public function getAdminCount(int $classSetId): int
    {
        return \App\Models\GuestModels\ClassSetMember::where('class_set_id', $classSetId)
            ->where('is_admin', true)
            ->count();
    }
}
