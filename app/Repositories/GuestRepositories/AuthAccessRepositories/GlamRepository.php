<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\GlamSeason;
use App\Models\GuestModels\GlamChallenge;
use App\Models\GuestModels\GlamSquad;
use App\Models\GuestModels\GlamSquadMember;
use App\Models\GuestModels\GlamEntry;
use App\Models\GuestModels\GlamVote;
use App\Models\GuestModels\GlamStanding;
use App\Models\GuestModels\GlamBadge;
use App\Models\GuestModels\GlamUserBadge;
use App\Models\GuestModels\GlamFollow;
use Illuminate\Support\Facades\Storage;

class GlamRepository
{
    // ── Seasons ──

    public function getActiveSeason(): ?GlamSeason
    {
        return GlamSeason::where('status', 'active')->first()
            ?? GlamSeason::orderByDesc('created_at')->first();
    }

    public function findSeason(int $id): ?GlamSeason
    {
        return GlamSeason::with(['challenges' => fn($q) => $q->orderBy('challenge_number')])->find($id);
    }

    public function findSeasonByUuid(string $uuid): ?GlamSeason
    {
        return GlamSeason::with(['challenges' => fn($q) => $q->orderBy('challenge_number')])
            ->where('uuid', $uuid)->first();
    }

    public function getAllSeasons()
    {
        return GlamSeason::orderByDesc('start_date')->get();
    }

    // ── Challenges ──

    public function getCurrentChallenge(int $seasonId): ?GlamChallenge
    {
        return GlamChallenge::where('season_id', $seasonId)
            ->whereIn('status', ['submissions_open', 'voting_open'])
            ->first()
            ?? GlamChallenge::where('season_id', $seasonId)
                ->where('status', 'upcoming')
                ->orderBy('challenge_number')
                ->first();
    }

    public function findChallenge(int $id): ?GlamChallenge
    {
        return GlamChallenge::with('season')->find($id);
    }

    public function findChallengeByUuid(string $uuid): ?GlamChallenge
    {
        return GlamChallenge::with('season')->where('uuid', $uuid)->first();
    }

    public function getChallengeHistory(int $seasonId)
    {
        return GlamChallenge::where('season_id', $seasonId)
            ->where('status', 'completed')
            ->orderByDesc('challenge_number')
            ->get();
    }

    // ── Squads ──

    public function getAvailableSquads(string $genderTrack)
    {
        return GlamSquad::where('gender_track', $genderTrack)
            ->where('is_active', true)
            ->withCount('members')
            ->orderBy('squad_number')
            ->get();
    }

    public function getUserGenderedSquad(int $userId): ?GlamSquadMember
    {
        return GlamSquadMember::where('user_id', $userId)
            ->whereHas('squad', fn($q) => $q->whereIn('gender_track', ['female', 'male']))
            ->with('squad')
            ->first();
    }

    public function getUserMixedSquad(int $userId): ?GlamSquadMember
    {
        return GlamSquadMember::where('user_id', $userId)
            ->whereHas('squad', fn($q) => $q->where('gender_track', 'mixed'))
            ->with('squad')
            ->first();
    }

    public function findNextAvailableSquad(string $genderTrack): ?GlamSquad
    {
        return GlamSquad::where('gender_track', $genderTrack)
            ->where('is_active', true)
            ->withCount('members')
            ->having('members_count', '<', \DB::raw('member_cap'))
            ->orderBy('squad_number')
            ->first();
    }

    public function createSquad(array $data): GlamSquad
    {
        return GlamSquad::create($data);
    }

    public function getNextSquadNumber(string $genderTrack): int
    {
        $max = GlamSquad::where('gender_track', $genderTrack)->max('squad_number');
        return ($max ?? 0) + 1;
    }

    public function addMember(int $squadId, int $userId): GlamSquadMember
    {
        return GlamSquadMember::create([
            'squad_id' => $squadId,
            'user_id' => $userId,
            'joined_at' => now(),
        ]);
    }

    public function removeMember(int $squadId, int $userId): bool
    {
        return GlamSquadMember::where('squad_id', $squadId)->where('user_id', $userId)->delete() > 0;
    }

    public function findSquad(int $id): ?GlamSquad
    {
        return GlamSquad::withCount('members')->find($id);
    }

    public function findSquadByUuid(string $uuid): ?GlamSquad
    {
        return GlamSquad::where('uuid', $uuid)->first();
    }

    public function getSquadMembers(int $squadId)
    {
        return GlamSquadMember::where('squad_id', $squadId)
            ->with('user')
            ->orderByDesc('is_admin')
            ->orderBy('joined_at')
            ->get();
    }

    public function getUserSquads(int $userId)
    {
        return GlamSquad::whereHas('members', fn($q) => $q->where('user_id', $userId))
            ->withCount('members')
            ->get();
    }

    // ── Entries ──

    public function findEntryByUuid(string $uuid): ?GlamEntry
    {
        return GlamEntry::where('uuid', $uuid)->first();
    }

    public function getUserEntry(int $challengeId, int $userId): ?GlamEntry
    {
        return GlamEntry::where('challenge_id', $challengeId)->where('user_id', $userId)->first();
    }

    public function createEntry(array $data): GlamEntry
    {
        return GlamEntry::create($data);
    }

    public function updateEntry(int $entryId, array $data): ?GlamEntry
    {
        $entry = GlamEntry::find($entryId);
        if ($entry) {
            $entry->update($data);
            return $entry->fresh();
        }
        return null;
    }

    public function getChallengeEntries(int $challengeId, string $genderTrack)
    {
        return GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $genderTrack)
            ->where('is_qualified', true)
            ->with('user')
            ->orderBy('rank')
            ->get();
    }

    public function getChallengeEntriesByTrack(int $challengeId, string $genderTrack)
    {
        return GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $genderTrack)
            ->with('user')
            ->get();
    }

    // ── Voting ──

    public function getNextVotableEntry(int $challengeId, int $userId): ?GlamEntry
    {
        // Get IDs the user has already voted on
        $votedEntryIds = GlamVote::where('voter_id', $userId)
            ->whereHas('entry', fn($q) => $q->where('challenge_id', $challengeId))
            ->pluck('entry_id');

        return GlamEntry::where('challenge_id', $challengeId)
            ->where('user_id', '!=', $userId)
            ->whereNotIn('id', $votedEntryIds)
            ->orderBy('vote_count')
            ->inRandomOrder()
            ->with('user')
            ->first();
    }

    public function castVote(int $entryId, int $voterId, int $stars): GlamVote
    {
        return GlamVote::create([
            'entry_id' => $entryId,
            'voter_id' => $voterId,
            'stars' => $stars,
        ]);
    }

    public function hasVoted(int $entryId, int $voterId): bool
    {
        return GlamVote::where('entry_id', $entryId)->where('voter_id', $voterId)->exists();
    }

    public function getUserVoteCount(int $challengeId, int $userId): int
    {
        return GlamVote::where('voter_id', $userId)
            ->whereHas('entry', fn($q) => $q->where('challenge_id', $challengeId))
            ->count();
    }

    public function getSeasonVoteCount(int $seasonId, int $userId): int
    {
        return GlamVote::where('voter_id', $userId)
            ->whereHas('entry.challenge', fn($q) => $q->where('season_id', $seasonId))
            ->count();
    }

    // ── Standings ──

    public function getStandings(int $seasonId, string $genderTrack)
    {
        return GlamStanding::where('season_id', $seasonId)
            ->where('gender_track', $genderTrack)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('top_1_count')
            ->get();
    }

    public function getUserStanding(int $seasonId, int $userId): ?GlamStanding
    {
        return GlamStanding::where('season_id', $seasonId)->where('user_id', $userId)->first();
    }

    // ── Badges ──

    public function getAllBadges()
    {
        return GlamBadge::all();
    }

    public function getUserBadges(int $userId)
    {
        return GlamUserBadge::where('user_id', $userId)
            ->with('badge')
            ->orderByDesc('earned_at')
            ->get();
    }

    // ── Following ──

    public function isFollowing(int $userId): bool
    {
        return GlamFollow::where('user_id', $userId)->exists();
    }

    public function follow(int $userId): GlamFollow
    {
        return GlamFollow::create(['user_id' => $userId]);
    }

    public function unfollow(int $userId): bool
    {
        return GlamFollow::where('user_id', $userId)->delete() > 0;
    }

    // ── Winners (for feed) ──

    public function getLatestWinners(): array
    {
        $activeSeason = GlamSeason::where('status', 'active')->first();

        if ($activeSeason) {
            return $this->getChallengeWinners();
        }

        return $this->getSeasonWinners();
    }

    private function getChallengeWinners(): array
    {
        $latestCompleted = GlamChallenge::where('status', 'completed')
            ->whereHas('entries', fn($q) => $q->where('is_qualified', true)->whereNotNull('rank'))
            ->orderByDesc('results_at')
            ->first();

        if (!$latestCompleted) return ['type' => 'challenge', 'title' => '', 'winners' => []];

        $winners = GlamEntry::where('challenge_id', $latestCompleted->id)
            ->where('is_qualified', true)
            ->where('rank', '<=', 4)
            ->with('user')
            ->orderBy('rank')
            ->get()
            ->map(fn($e) => [
                'rank' => $e->rank,
                'user' => $e->user ? [
                    'id' => $e->user->id,
                    'first_name' => $e->user->first_name,
                    'last_name' => $e->user->last_name,
                    'username' => $e->user->username,
                    'profile_image_url' => $e->user->profile_image_url,
                ] : null,
                'photo_1' => $e->photo_1 ? Storage::url($e->photo_1) : null,
                'score' => $e->weighted_score,
                'challenge_uuid' => $latestCompleted->uuid,
                'gender_track' => $e->gender_track,
            ]);

        return [
            'type' => 'challenge',
            'title' => $latestCompleted->title,
            'winners' => $winners->toArray(),
        ];
    }

    private function getSeasonWinners(): array
    {
        $lastSeason = GlamSeason::where('status', 'completed')
            ->orderByDesc('end_date')
            ->first();

        if (!$lastSeason) return ['type' => 'season', 'title' => '', 'season_uuid' => null, 'winners' => []];

        $standings = GlamStanding::where('season_id', $lastSeason->id)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('top_1_count')
            ->get();

        $winners = collect();

        foreach (['female', 'male'] as $track) {
            $trackStandings = $standings->where('gender_track', $track)->values()->take(4);
            foreach ($trackStandings as $idx => $s) {
                $winners->push([
                    'rank' => $idx + 1,
                    'user' => $s->user ? [
                        'id' => $s->user->id,
                        'first_name' => $s->user->first_name,
                        'last_name' => $s->user->last_name,
                        'username' => $s->user->username,
                        'profile_image_url' => $s->user->profile_image_url,
                    ] : null,
                    'photo_1' => $s->user && $s->user->profile_image_url ? $s->user->profile_image_url : null,
                    'score' => $s->total_points,
                    'challenge_uuid' => null,
                    'gender_track' => $track,
                ]);
            }
        }

        return [
            'type' => 'season',
            'title' => $lastSeason->name,
            'season_uuid' => $lastSeason->uuid,
            'winners' => $winners->toArray(),
        ];
    }
}
