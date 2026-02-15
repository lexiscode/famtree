<?php

namespace App\Repositories\GuestRepositories\AuthAccessRepositories;

use App\Models\GuestModels\PredictionSeason;
use App\Models\GuestModels\PredictionGameweek;
use App\Models\GuestModels\PredictionFixture;
use App\Models\GuestModels\PredictionEntry;
use App\Models\GuestModels\PredictionStanding;
use App\Models\GuestModels\PredictionGameweekStanding;
use App\Models\GuestModels\PredictionGroupStanding;
use App\Models\GuestModels\PredictionBadge;
use App\Models\GuestModels\PredictionUserBadge;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\ClassSetMember;

class PredictionRepository
{
    /**
     * Get the active or latest season for an organization.
     */
    public function getActiveSeason(int $organizationId): ?PredictionSeason
    {
        return PredictionSeason::where('organization_id', $organizationId)
            ->where('status', 'active')
            ->first()
            ?? PredictionSeason::where('organization_id', $organizationId)
                ->orderByDesc('created_at')
                ->first();
    }

    /**
     * Get all seasons for an organization.
     */
    public function getSeasons(int $organizationId)
    {
        return PredictionSeason::where('organization_id', $organizationId)
            ->orderByDesc('start_date')
            ->get();
    }

    /**
     * Get season by ID.
     */
    public function findSeason(int $id): ?PredictionSeason
    {
        return PredictionSeason::with('gameweeks')->find($id);
    }

    /**
     * Get upcoming fixtures for a season that are still open for predictions.
     */
    public function getUpcomingFixtures(int $seasonId)
    {
        return PredictionFixture::where('season_id', $seasonId)
            ->where('status', 'upcoming')
            ->where('match_date', '>', now())
            ->orderBy('match_date')
            ->get();
    }

    /**
     * Get all fixtures for a season.
     */
    public function getSeasonFixtures(int $seasonId)
    {
        return PredictionFixture::where('season_id', $seasonId)
            ->with('gameweek')
            ->orderByDesc('match_date')
            ->get();
    }

    /**
     * Get fixtures for a gameweek.
     */
    public function getGameweekFixtures(int $gameweekId)
    {
        return PredictionFixture::where('gameweek_id', $gameweekId)
            ->orderBy('match_date')
            ->get();
    }

    /**
     * Get open fixtures for prediction within an organization.
     */
    public function getOpenFixturesForOrg(int $organizationId)
    {
        return PredictionFixture::where('organization_id', $organizationId)
            ->where('status', 'upcoming')
            ->where('match_date', '>', now())
            ->orderBy('match_date')
            ->get();
    }

    /**
     * Get user's prediction for a specific fixture.
     */
    public function getUserPrediction(int $fixtureId, int $userId): ?PredictionEntry
    {
        return PredictionEntry::where('fixture_id', $fixtureId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Get user's predictions for multiple fixtures.
     */
    public function getUserPredictions(array $fixtureIds, int $userId)
    {
        return PredictionEntry::whereIn('fixture_id', $fixtureIds)
            ->where('user_id', $userId)
            ->get()
            ->keyBy('fixture_id');
    }

    /**
     * Create or update a prediction entry.
     */
    public function upsertPrediction(int $fixtureId, int $userId, array $data): PredictionEntry
    {
        return PredictionEntry::updateOrCreate(
            ['fixture_id' => $fixtureId, 'user_id' => $userId],
            $data
        );
    }

    /**
     * Get season standings.
     */
    public function getStandings(int $seasonId)
    {
        return PredictionStanding::where('season_id', $seasonId)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('correct_predictions')
            ->get();
    }

    /**
     * Get gameweek standings.
     */
    public function getGameweekStandings(int $gameweekId)
    {
        return PredictionGameweekStanding::where('gameweek_id', $gameweekId)
            ->with('user')
            ->orderByDesc('points')
            ->orderByDesc('correct_predictions')
            ->get();
    }

    /**
     * Get group standings for a class set.
     */
    public function getGroupStandings(int $seasonId, int $classSetId)
    {
        return PredictionGroupStanding::where('season_id', $seasonId)
            ->where('class_set_id', $classSetId)
            ->with('user')
            ->orderByDesc('total_points')
            ->orderByDesc('correct_predictions')
            ->get();
    }

    /**
     * Get all badges.
     */
    public function getAllBadges()
    {
        return PredictionBadge::all();
    }

    /**
     * Get user's earned badges for a season.
     */
    public function getUserBadges(int $userId, int $seasonId)
    {
        return PredictionUserBadge::where('user_id', $userId)
            ->where('season_id', $seasonId)
            ->with('badge')
            ->get();
    }

    /**
     * Get all badge awards for a season.
     */
    public function getSeasonBadgeAwards(int $seasonId)
    {
        return PredictionUserBadge::where('season_id', $seasonId)
            ->with(['badge', 'user'])
            ->orderByDesc('earned_at')
            ->get();
    }

    /**
     * Get user's prediction history for a season.
     */
    public function getUserHistory(int $userId, int $seasonId)
    {
        return PredictionEntry::where('user_id', $userId)
            ->whereHas('fixture', fn($q) => $q->where('season_id', $seasonId))
            ->with(['fixture.gameweek'])
            ->orderByDesc('created_at')
            ->get();
    }

    /**
     * Get user's standing for a season.
     */
    public function getUserStanding(int $userId, int $seasonId): ?PredictionStanding
    {
        return PredictionStanding::where('season_id', $seasonId)
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Get organization by slug with category.
     */
    public function getOrganizationBySlug(string $slug): ?Organization
    {
        return Organization::with('category')->where('slug', $slug)->first();
    }

    /**
     * Check if user is a member of any group in the organization.
     */
    public function isOrgMember(int $userId, int $organizationId): bool
    {
        return ClassSetMember::where('user_id', $userId)
            ->whereHas('classSet.department.faculty', fn($q) => $q->where('organization_id', $organizationId))
            ->exists();
    }
}
