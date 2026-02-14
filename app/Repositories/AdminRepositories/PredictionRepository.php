<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\PredictionSeason;
use App\Models\GuestModels\PredictionGameweek;
use App\Models\GuestModels\PredictionFixture;
use App\Models\GuestModels\PredictionEntry;
use App\Models\GuestModels\PredictionStanding;
use App\Models\GuestModels\PredictionBadge;
use App\Models\GuestModels\PredictionUserBadge;
use App\Models\GuestModels\Organization;
use Illuminate\Pagination\LengthAwarePaginator;

class PredictionRepository
{
    // ── Seasons ──

    public function getAllSeasons(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return PredictionSeason::with('organization')
            ->withCount(['fixtures', 'standings'])
            ->orderByDesc('created_at')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findSeason(int $id): ?PredictionSeason
    {
        return PredictionSeason::with(['organization', 'gameweeks', 'fixtures.gameweek'])
            ->withCount(['fixtures', 'standings'])
            ->find($id);
    }

    public function createSeason(array $data): PredictionSeason
    {
        return PredictionSeason::create($data);
    }

    public function updateSeason(int $id, array $data): ?PredictionSeason
    {
        $season = PredictionSeason::find($id);
        if ($season) {
            $season->update($data);
            return $season->fresh();
        }
        return null;
    }

    public function seasonCount(): int
    {
        return PredictionSeason::count();
    }

    public function activeSeasonCount(): int
    {
        return PredictionSeason::where('status', 'active')->count();
    }

    // ── Gameweeks ──

    public function createGameweek(array $data): PredictionGameweek
    {
        return PredictionGameweek::create($data);
    }

    public function updateGameweek(int $id, array $data): ?PredictionGameweek
    {
        $gw = PredictionGameweek::find($id);
        if ($gw) {
            $gw->update($data);
            return $gw->fresh();
        }
        return null;
    }

    public function getNextGameweekNumber(int $seasonId): int
    {
        $max = PredictionGameweek::where('season_id', $seasonId)->max('number');
        return ($max ?? 0) + 1;
    }

    // ── Fixtures ──

    public function createFixture(array $data): PredictionFixture
    {
        return PredictionFixture::create($data);
    }

    public function findFixture(int $id): ?PredictionFixture
    {
        return PredictionFixture::with(['season', 'gameweek', 'entries.user'])->find($id);
    }

    public function updateFixture(int $id, array $data): ?PredictionFixture
    {
        $fixture = PredictionFixture::find($id);
        if ($fixture) {
            $fixture->update($data);
            return $fixture->fresh();
        }
        return null;
    }

    public function fixtureCount(): int
    {
        return PredictionFixture::count();
    }

    public function totalPredictions(): int
    {
        return PredictionEntry::count();
    }

    // ── Standings ──

    public function getSeasonStandings(int $seasonId)
    {
        return PredictionStanding::where('season_id', $seasonId)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('correct_predictions')
            ->get();
    }

    // ── Badges ──

    public function getSeasonBadges(int $seasonId)
    {
        return PredictionUserBadge::where('season_id', $seasonId)
            ->with(['badge', 'user'])
            ->orderByDesc('earned_at')
            ->get();
    }

    // ── Football Organizations ──

    public function getFootballOrganizations()
    {
        return Organization::whereHas('category', function ($q) {
            $q->where('slug', 'football-fans');
        })->select('id', 'name', 'slug', 'logo_url')->get();
    }
}
