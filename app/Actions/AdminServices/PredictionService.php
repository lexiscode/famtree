<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\PredictionRepository;
use App\Actions\GuestServices\AuthAccessServices\PredictionScoringService;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class PredictionService
{
    public function __construct(
        private PredictionRepository $repository,
        private PredictionScoringService $scoringService,
    ) {}

    // ── Season CRUD ──

    public function getAllSeasons(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllSeasons($perPage, $page)->through(fn($s) => [
            'id' => $s->id,
            'uuid' => $s->uuid,
            'name' => $s->name,
            'slug' => $s->slug,
            'status' => $s->status,
            'start_date' => $s->start_date->format('Y-m-d'),
            'end_date' => $s->end_date->format('Y-m-d'),
            'organization' => $s->organization ? [
                'id' => $s->organization->id,
                'name' => $s->organization->name,
                'logo_url' => $s->organization->logo_url,
            ] : null,
            'fixtures_count' => $s->fixtures_count,
            'standings_count' => $s->standings_count,
            'created_at' => $s->created_at->format('Y-m-d'),
        ]);
    }

    public function getSeasonDetails(int $id): ?array
    {
        $season = $this->repository->findSeason($id);
        if (!$season) return null;

        return [
            'id' => $season->id,
            'uuid' => $season->uuid,
            'name' => $season->name,
            'slug' => $season->slug,
            'status' => $season->status,
            'start_date' => $season->start_date->format('Y-m-d'),
            'end_date' => $season->end_date->format('Y-m-d'),
            'organization' => $season->organization ? [
                'id' => $season->organization->id,
                'name' => $season->organization->name,
                'logo_url' => $season->organization->logo_url,
            ] : null,
            'fixtures_count' => $season->fixtures_count,
            'standings_count' => $season->standings_count,
            'gameweeks' => $season->gameweeks->map(fn($gw) => [
                'id' => $gw->id,
                'number' => $gw->number,
                'label' => $gw->label,
                'start_date' => $gw->start_date->format('Y-m-d'),
                'end_date' => $gw->end_date->format('Y-m-d'),
                'fixtures_count' => $gw->fixtures()->count(),
            ]),
            'fixtures' => $season->fixtures->map(fn($f) => [
                'id' => $f->id,
                'uuid' => $f->uuid,
                'opponent_name' => $f->opponent_name,
                'opponent_logo' => $f->opponent_logo,
                'venue' => $f->venue,
                'competition' => $f->competition,
                'match_date' => $f->match_date->format('Y-m-d H:i'),
                'status' => $f->status,
                'home_score' => $f->home_score,
                'away_score' => $f->away_score,
                'gameweek' => $f->gameweek ? [
                    'id' => $f->gameweek->id,
                    'number' => $f->gameweek->number,
                    'label' => $f->gameweek->label,
                ] : null,
                'entries_count' => $f->entries()->count(),
            ]),
            'created_at' => $season->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function createSeason(array $data): bool
    {
        try {
            $data['uuid'] = Str::uuid()->toString();
            $data['slug'] = Str::slug($data['name']);
            $season = $this->repository->createSeason($data);
            $this->logActivity('create_prediction_season', 'PredictionSeason', $season->id, "Created prediction season: {$season->name}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function updateSeason(int $id, array $data): bool
    {
        try {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }
            $season = $this->repository->updateSeason($id, $data);
            if ($season) {
                $this->logActivity('update_prediction_season', 'PredictionSeason', $id, "Updated prediction season: {$season->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function activateSeason(int $id): bool
    {
        try {
            $season = $this->repository->updateSeason($id, ['status' => 'active']);
            if ($season) {
                $this->logActivity('activate_prediction_season', 'PredictionSeason', $id, "Activated prediction season: {$season->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function completeSeason(int $id): bool
    {
        try {
            $season = $this->repository->updateSeason($id, ['status' => 'completed']);
            if ($season) {
                $this->logActivity('complete_prediction_season', 'PredictionSeason', $id, "Completed prediction season: {$season->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Gameweek CRUD ──

    public function createGameweek(int $seasonId, array $data): bool
    {
        try {
            $data['season_id'] = $seasonId;
            if (!isset($data['number'])) {
                $data['number'] = $this->repository->getNextGameweekNumber($seasonId);
            }
            $gw = $this->repository->createGameweek($data);
            $this->logActivity('create_prediction_gameweek', 'PredictionGameweek', $gw->id, "Created gameweek {$gw->number} for season #{$seasonId}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function updateGameweek(int $id, array $data): bool
    {
        try {
            $gw = $this->repository->updateGameweek($id, $data);
            if ($gw) {
                $this->logActivity('update_prediction_gameweek', 'PredictionGameweek', $id, "Updated gameweek {$gw->number}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Fixture CRUD ──

    public function createFixture(int $seasonId, array $data): bool
    {
        try {
            $season = $this->repository->findSeason($seasonId);
            if (!$season) return false;

            $data['uuid'] = Str::uuid()->toString();
            $data['season_id'] = $seasonId;
            $data['organization_id'] = $season->organization_id;

            $fixture = $this->repository->createFixture($data);
            $this->logActivity('create_prediction_fixture', 'PredictionFixture', $fixture->id, "Created fixture: vs {$fixture->opponent_name}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function updateFixture(int $id, array $data): bool
    {
        try {
            $fixture = $this->repository->updateFixture($id, $data);
            if ($fixture) {
                $this->logActivity('update_prediction_fixture', 'PredictionFixture', $id, "Updated fixture: vs {$fixture->opponent_name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function enterResult(int $fixtureId, int $homeScore, int $awayScore): bool
    {
        try {
            $fixture = $this->repository->updateFixture($fixtureId, [
                'home_score' => $homeScore,
                'away_score' => $awayScore,
                'status' => 'completed',
            ]);

            if (!$fixture) return false;

            // Trigger scoring engine
            $this->scoringService->scoreFixture($fixtureId);

            $this->logActivity('enter_prediction_result', 'PredictionFixture', $fixtureId, "Entered result {$homeScore}-{$awayScore} for fixture vs {$fixture->opponent_name}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function cancelFixture(int $fixtureId): bool
    {
        try {
            $fixture = $this->repository->updateFixture($fixtureId, ['status' => 'cancelled']);
            if ($fixture) {
                $this->logActivity('cancel_prediction_fixture', 'PredictionFixture', $fixtureId, "Cancelled fixture: vs {$fixture->opponent_name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Standings & Badges ──

    public function getSeasonStandings(int $seasonId): array
    {
        $standings = $this->repository->getSeasonStandings($seasonId);
        return $standings->map(fn($s, $index) => [
            'rank' => $index + 1,
            'user_id' => $s->user_id,
            'user' => $s->user ? [
                'id' => $s->user->id,
                'first_name' => $s->user->first_name,
                'last_name' => $s->user->last_name,
                'username' => $s->user->username,
                'profile_image' => $s->user->profile_image,
            ] : null,
            'total_points' => $s->total_points,
            'predictions_made' => $s->predictions_made,
            'correct_predictions' => $s->correct_predictions,
            'accuracy' => $s->accuracy(),
            'current_streak' => $s->current_streak,
            'best_streak' => $s->best_streak,
        ])->toArray();
    }

    public function getSeasonBadges(int $seasonId): array
    {
        $badges = $this->repository->getSeasonBadges($seasonId);
        return $badges->map(fn($ub) => [
            'id' => $ub->id,
            'badge' => $ub->badge ? [
                'name' => $ub->badge->name,
                'slug' => $ub->badge->slug,
                'icon' => $ub->badge->icon,
                'color' => $ub->badge->color,
                'description' => $ub->badge->description,
            ] : null,
            'user' => $ub->user ? [
                'id' => $ub->user->id,
                'first_name' => $ub->user->first_name,
                'last_name' => $ub->user->last_name,
                'username' => $ub->user->username,
            ] : null,
            'times_earned' => $ub->times_earned,
            'earned_at' => $ub->earned_at->format('Y-m-d H:i'),
        ])->toArray();
    }

    // ── Stats ──

    public function getStats(): array
    {
        return [
            'total_seasons' => $this->repository->seasonCount(),
            'active_seasons' => $this->repository->activeSeasonCount(),
            'total_fixtures' => $this->repository->fixtureCount(),
            'total_predictions' => $this->repository->totalPredictions(),
        ];
    }

    // ── Football Organizations ──

    public function getFootballOrganizations(): array
    {
        return $this->repository->getFootballOrganizations()->toArray();
    }

    // ── Activity Log ──

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {}
    }
}
