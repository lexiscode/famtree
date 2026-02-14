<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\PredictionRepository;
use App\Models\GuestModels\PredictionFixture;
use App\Models\GuestModels\ClassSet;

class PredictionService
{
    public function __construct(private PredictionRepository $repository) {}

    /**
     * Get full league page data for an organization.
     */
    public function getLeagueData(string $orgSlug, int $userId, ?int $seasonId = null): ?array
    {
        $org = $this->repository->getOrganizationBySlug($orgSlug);
        if (!$org || !$org->category || $org->category->slug !== 'football-fans') {
            return null;
        }

        // Get seasons
        $seasons = $this->repository->getSeasons($org->id);
        if ($seasons->isEmpty()) {
            return [
                'organization' => $this->formatOrg($org),
                'seasons' => [],
                'activeSeason' => null,
                'standings' => [],
                'fixtures' => [],
                'upcomingFixtures' => [],
                'userPredictions' => [],
                'userStanding' => null,
                'gameweeks' => [],
                'badges' => [],
                'userBadges' => [],
                'isEligible' => $this->repository->isOrgMember($userId, $org->id),
            ];
        }

        // Get active season (or specified one)
        $season = $seasonId
            ? $this->repository->findSeason($seasonId)
            : $this->repository->getActiveSeason($org->id);

        if (!$season) {
            $season = $seasons->first();
        }

        // Get fixtures and user predictions
        $fixtures = $this->repository->getSeasonFixtures($season->id);
        $fixtureIds = $fixtures->pluck('id')->toArray();
        $userPredictions = $this->repository->getUserPredictions($fixtureIds, $userId);
        $upcomingFixtures = $this->repository->getUpcomingFixtures($season->id);

        // Get standings
        $standings = $this->repository->getStandings($season->id);

        // Get badges
        $allBadges = $this->repository->getAllBadges();
        $userBadges = $this->repository->getUserBadges($userId, $season->id);

        // Get user standing
        $userStanding = $this->repository->getUserStanding($userId, $season->id);

        return [
            'organization' => $this->formatOrg($org),
            'seasons' => $seasons->map(fn($s) => [
                'id' => $s->id, 'name' => $s->name, 'status' => $s->status,
            ])->toArray(),
            'activeSeason' => [
                'id' => $season->id,
                'name' => $season->name,
                'status' => $season->status,
                'start_date' => $season->start_date->format('Y-m-d'),
                'end_date' => $season->end_date->format('Y-m-d'),
                'gameweeks' => $season->gameweeks->map(fn($gw) => [
                    'id' => $gw->id, 'number' => $gw->number, 'label' => $gw->label,
                    'start_date' => $gw->start_date->format('Y-m-d'),
                    'end_date' => $gw->end_date->format('Y-m-d'),
                ])->toArray(),
            ],
            'standings' => $standings->map(fn($s, $i) => [
                'rank' => $i + 1,
                'user_id' => $s->user_id,
                'first_name' => $s->user?->first_name,
                'last_name' => $s->user?->last_name,
                'username' => $s->user?->username,
                'profile_image_url' => $s->user?->profile_image_url,
                'total_points' => $s->total_points,
                'predictions_made' => $s->predictions_made,
                'correct_predictions' => $s->correct_predictions,
                'accuracy' => $s->accuracy(),
                'current_streak' => $s->current_streak,
                'best_streak' => $s->best_streak,
            ])->toArray(),
            'fixtures' => $fixtures->map(fn($f) => $this->formatFixture($f, $userPredictions))->toArray(),
            'upcomingFixtures' => $upcomingFixtures->map(fn($f) => $this->formatFixture($f, $userPredictions))->toArray(),
            'userPredictions' => $userPredictions->map(fn($p) => [
                'fixture_id' => $p->fixture_id,
                'prediction_type' => $p->prediction_type,
                'prediction_value' => $p->prediction_value,
                'predicted_home_score' => $p->predicted_home_score,
                'predicted_away_score' => $p->predicted_away_score,
                'is_correct' => $p->is_correct,
                'points_earned' => $p->points_earned,
                'is_locked' => $p->is_locked,
            ])->values()->toArray(),
            'userStanding' => $userStanding ? [
                'total_points' => $userStanding->total_points,
                'predictions_made' => $userStanding->predictions_made,
                'correct_predictions' => $userStanding->correct_predictions,
                'accuracy' => $userStanding->accuracy(),
                'current_streak' => $userStanding->current_streak,
                'best_streak' => $userStanding->best_streak,
                'match_result_correct' => $userStanding->match_result_correct,
                'double_chance_correct' => $userStanding->double_chance_correct,
                'correct_score_correct' => $userStanding->correct_score_correct,
            ] : null,
            'badges' => $allBadges->map(fn($b) => [
                'id' => $b->id, 'slug' => $b->slug, 'name' => $b->name,
                'description' => $b->description, 'icon' => $b->icon, 'color' => $b->color,
            ])->toArray(),
            'userBadges' => $userBadges->map(fn($ub) => [
                'badge_slug' => $ub->badge?->slug,
                'times_earned' => $ub->times_earned,
                'earned_at' => $ub->earned_at->format('Y-m-d H:i'),
            ])->toArray(),
            'isEligible' => $this->repository->isOrgMember($userId, $org->id),
        ];
    }

    /**
     * Submit a prediction.
     */
    public function submitPrediction(string $orgSlug, int $userId, array $data): array
    {
        $org = $this->repository->getOrganizationBySlug($orgSlug);
        if (!$org) {
            return ['success' => false, 'message' => 'Organization not found'];
        }

        if (!$this->repository->isOrgMember($userId, $org->id)) {
            return ['success' => false, 'message' => 'You must be a member of a group to make predictions'];
        }

        $fixture = PredictionFixture::find($data['fixture_id']);
        if (!$fixture || $fixture->organization_id !== $org->id) {
            return ['success' => false, 'message' => 'Fixture not found'];
        }

        if ($fixture->isLocked()) {
            return ['success' => false, 'message' => 'Predictions are locked for this fixture'];
        }

        // Check if user already has a locked prediction
        $existing = $this->repository->getUserPrediction($fixture->id, $userId);
        if ($existing && $existing->is_locked) {
            return ['success' => false, 'message' => 'Your prediction is already locked'];
        }

        $predictionData = [
            'prediction_type' => $data['prediction_type'],
            'prediction_value' => $data['prediction_value'] ?? null,
            'predicted_home_score' => $data['predicted_home_score'] ?? null,
            'predicted_away_score' => $data['predicted_away_score'] ?? null,
        ];

        $this->repository->upsertPrediction($fixture->id, $userId, $predictionData);

        return ['success' => true, 'message' => 'Prediction saved'];
    }

    /**
     * Get prediction history for a user.
     */
    public function getUserHistory(string $orgSlug, int $userId, ?int $seasonId = null): array
    {
        $org = $this->repository->getOrganizationBySlug($orgSlug);
        if (!$org) return [];

        $season = $seasonId
            ? $this->repository->findSeason($seasonId)
            : $this->repository->getActiveSeason($org->id);

        if (!$season) return [];

        $history = $this->repository->getUserHistory($userId, $season->id);

        return $history->map(fn($entry) => [
            'id' => $entry->id,
            'fixture' => [
                'id' => $entry->fixture->id,
                'opponent_name' => $entry->fixture->opponent_name,
                'opponent_logo' => $entry->fixture->opponent_logo,
                'venue' => $entry->fixture->venue,
                'competition' => $entry->fixture->competition,
                'match_date' => $entry->fixture->match_date->format('Y-m-d H:i'),
                'status' => $entry->fixture->status,
                'home_score' => $entry->fixture->home_score,
                'away_score' => $entry->fixture->away_score,
                'gameweek' => $entry->fixture->gameweek ? [
                    'number' => $entry->fixture->gameweek->number,
                    'label' => $entry->fixture->gameweek->label,
                ] : null,
            ],
            'prediction_type' => $entry->prediction_type,
            'prediction_value' => $entry->prediction_value,
            'predicted_home_score' => $entry->predicted_home_score,
            'predicted_away_score' => $entry->predicted_away_score,
            'is_correct' => $entry->is_correct,
            'points_earned' => $entry->points_earned,
            'is_locked' => $entry->is_locked,
        ])->toArray();
    }

    /**
     * Get open fixtures for a class set's organization (for banner).
     */
    public function getOpenFixturesForClassSet(string $classSetUuid, int $userId): array
    {
        $classSet = ClassSet::where('uuid', $classSetUuid)->first();
        if (!$classSet) return [];

        $dept = $classSet->department;
        if (!$dept) return [];

        $faculty = $dept->faculty;
        if (!$faculty) return [];

        $org = $faculty->organization;
        if (!$org || !$org->category || $org->category->slug !== 'football-fans') return [];

        $fixtures = $this->repository->getOpenFixturesForOrg($org->id);
        $fixtureIds = $fixtures->pluck('id')->toArray();
        $userPredictions = $this->repository->getUserPredictions($fixtureIds, $userId);

        return [
            'fixtures' => $fixtures->map(fn($f) => $this->formatFixture($f, $userPredictions))->toArray(),
            'organizationSlug' => $org->slug,
            'organizationName' => $org->short_name ?: $org->name,
            'organizationLogo' => $org->logo_url,
        ];
    }

    /**
     * Get mini-league standings for a class set.
     */
    public function getGroupStandings(string $classSetUuid): array
    {
        $classSet = ClassSet::where('uuid', $classSetUuid)->first();
        if (!$classSet) return [];

        $dept = $classSet->department;
        if (!$dept) return [];
        $faculty = $dept->faculty;
        if (!$faculty) return [];

        $org = $faculty->organization;
        if (!$org) return [];

        $season = $this->repository->getActiveSeason($org->id);
        if (!$season) return [];

        $standings = $this->repository->getGroupStandings($season->id, $classSet->id);

        return $standings->map(fn($s, $i) => [
            'rank' => $i + 1,
            'user_id' => $s->user_id,
            'first_name' => $s->user?->first_name,
            'last_name' => $s->user?->last_name,
            'username' => $s->user?->username,
            'profile_image_url' => $s->user?->profile_image_url,
            'total_points' => $s->total_points,
            'predictions_made' => $s->predictions_made,
            'correct_predictions' => $s->correct_predictions,
        ])->toArray();
    }

    private function formatOrg($org): array
    {
        return [
            'id' => $org->id,
            'name' => $org->name,
            'slug' => $org->slug,
            'short_name' => $org->short_name,
            'logo_url' => $org->logo_url,
            'category_slug' => $org->category?->slug,
        ];
    }

    private function formatFixture($fixture, $userPredictions): array
    {
        $prediction = $userPredictions->get($fixture->id);
        return [
            'id' => $fixture->id,
            'uuid' => $fixture->uuid,
            'opponent_name' => $fixture->opponent_name,
            'opponent_logo' => $fixture->opponent_logo,
            'venue' => $fixture->venue,
            'competition' => $fixture->competition,
            'match_date' => $fixture->match_date->format('Y-m-d H:i'),
            'status' => $fixture->status,
            'home_score' => $fixture->home_score,
            'away_score' => $fixture->away_score,
            'gameweek_id' => $fixture->gameweek_id,
            'user_prediction' => $prediction ? [
                'prediction_type' => $prediction->prediction_type,
                'prediction_value' => $prediction->prediction_value,
                'predicted_home_score' => $prediction->predicted_home_score,
                'predicted_away_score' => $prediction->predicted_away_score,
                'is_correct' => $prediction->is_correct,
                'points_earned' => $prediction->points_earned,
                'is_locked' => $prediction->is_locked,
            ] : null,
        ];
    }
}
