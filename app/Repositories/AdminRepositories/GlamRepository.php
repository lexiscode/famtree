<?php

namespace App\Repositories\AdminRepositories;

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
use Illuminate\Pagination\LengthAwarePaginator;

class GlamRepository
{
    // ── Seasons ──

    public function getAllSeasons(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return GlamSeason::withCount(['challenges', 'standings'])
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findSeason(int $id): ?GlamSeason
    {
        return GlamSeason::with(['challenges' => function ($q) {
            $q->orderBy('challenge_number');
        }])
            ->withCount(['challenges', 'standings'])
            ->find($id);
    }

    public function createSeason(array $data): GlamSeason
    {
        return GlamSeason::create($data);
    }

    public function updateSeason(int $id, array $data): ?GlamSeason
    {
        $season = GlamSeason::find($id);
        if ($season) {
            $season->update($data);
            return $season->fresh();
        }
        return null;
    }

    public function seasonCount(): int
    {
        return GlamSeason::count();
    }

    public function activeSeasonCount(): int
    {
        return GlamSeason::where('status', 'active')->count();
    }

    // ── Challenges ──

    public function createChallenge(array $data): GlamChallenge
    {
        return GlamChallenge::create($data);
    }

    public function findChallenge(int $id): ?GlamChallenge
    {
        return GlamChallenge::with(['season', 'entries.user'])->find($id);
    }

    public function updateChallenge(int $id, array $data): ?GlamChallenge
    {
        $challenge = GlamChallenge::find($id);
        if ($challenge) {
            $challenge->update($data);
            return $challenge->fresh();
        }
        return null;
    }

    public function getNextChallengeNumber(int $seasonId): int
    {
        $max = GlamChallenge::where('season_id', $seasonId)->max('challenge_number');
        return ($max ?? 0) + 1;
    }

    public function challengeCount(): int
    {
        return GlamChallenge::count();
    }

    // ── Squads ──

    public function getAllSquads()
    {
        return GlamSquad::withCount('members')
            ->orderBy('gender_track')
            ->orderBy('squad_number')
            ->get();
    }

    public function findSquad(int $id): ?GlamSquad
    {
        return GlamSquad::with(['members.user'])->withCount('members')->find($id);
    }

    public function removeSquadMember(int $squadId, int $userId): bool
    {
        return GlamSquadMember::where('squad_id', $squadId)->where('user_id', $userId)->delete() > 0;
    }

    // ── Stats ──

    public function totalEntries(): int
    {
        return GlamEntry::count();
    }

    public function totalVotes(): int
    {
        return GlamVote::count();
    }

    public function totalMembers(): int
    {
        return GlamSquadMember::distinct('user_id')->count('user_id');
    }

    public function totalFollowers(): int
    {
        return GlamFollow::count();
    }

    // ── Standings ──

    public function getSeasonStandings(int $seasonId, string $track)
    {
        return GlamStanding::where('season_id', $seasonId)
            ->where('gender_track', $track)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('top_1_count')
            ->get();
    }

    // ── Badges ──

    public function getSeasonBadges(int $seasonId)
    {
        return GlamUserBadge::where('season_id', $seasonId)
            ->with(['badge', 'user'])
            ->orderByDesc('earned_at')
            ->get();
    }
}
