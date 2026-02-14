<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\PredictionFixture;
use App\Models\GuestModels\PredictionEntry;
use App\Models\GuestModels\PredictionStanding;
use App\Models\GuestModels\PredictionGameweekStanding;
use App\Models\GuestModels\PredictionGroupStanding;
use App\Models\GuestModels\PredictionBadge;
use App\Models\GuestModels\PredictionUserBadge;
use App\Models\GuestModels\ClassSetMember;
use App\Models\GuestModels\ClassSet;
use App\Models\GuestModels\Department;
use App\Models\GuestModels\Faculty;

class PredictionScoringService
{
    /**
     * Score all predictions for a completed fixture.
     */
    public function scoreFixture(int $fixtureId): void
    {
        $fixture = PredictionFixture::with('entries')->find($fixtureId);
        if (!$fixture || $fixture->home_score === null || $fixture->away_score === null) {
            return;
        }

        $actualHomeScore = $fixture->home_score;
        $actualAwayScore = $fixture->away_score;
        $resultType = $this->determineResultType($actualHomeScore, $actualAwayScore);
        $isCleanSheet = ($actualHomeScore === 0 || $actualAwayScore === 0);

        foreach ($fixture->entries as $entry) {
            $this->scoreEntry($entry, $resultType, $actualHomeScore, $actualAwayScore);
            $this->updateStandings($entry, $fixture);
            if ($fixture->gameweek_id) {
                $this->updateGameweekStandings($entry, $fixture->gameweek_id);
            }
            $this->updateGroupStandings($entry, $fixture);
        }

        // After all entries scored, update streaks and check badges
        $scoredUserIds = $fixture->entries->pluck('user_id')->unique();
        foreach ($scoredUserIds as $userId) {
            $this->updateStreak($userId, $fixture->season_id);
            $this->checkBadges($userId, $fixture);
        }
    }

    /**
     * Determine the match result type from scores.
     */
    private function determineResultType(int $homeScore, int $awayScore): string
    {
        if ($homeScore > $awayScore) return 'home_win';
        if ($homeScore < $awayScore) return 'away_win';
        return 'draw';
    }

    /**
     * Score an individual prediction entry.
     */
    private function scoreEntry(PredictionEntry $entry, string $resultType, int $homeScore, int $awayScore): void
    {
        $isCorrect = false;
        $points = 0;

        switch ($entry->prediction_type) {
            case 'match_result':
                $isCorrect = $entry->prediction_value === $resultType;
                $points = $isCorrect ? 5 : 0;
                break;

            case 'double_chance':
                $isCorrect = match ($entry->prediction_value) {
                    'home_draw' => $resultType === 'home_win' || $resultType === 'draw',
                    'away_draw' => $resultType === 'away_win' || $resultType === 'draw',
                    'home_away' => $resultType === 'home_win' || $resultType === 'away_win',
                    default => false,
                };
                $points = $isCorrect ? 2 : 0;
                break;

            case 'correct_score':
                $isCorrect = $entry->predicted_home_score === $homeScore
                    && $entry->predicted_away_score === $awayScore;
                $points = $isCorrect ? 15 : 0;
                break;
        }

        $entry->update([
            'is_correct' => $isCorrect,
            'points_earned' => $points,
            'is_locked' => true,
        ]);
    }

    /**
     * Update season standings for a user after scoring.
     */
    private function updateStandings(PredictionEntry $entry, PredictionFixture $fixture): void
    {
        $standing = PredictionStanding::firstOrCreate(
            ['season_id' => $fixture->season_id, 'user_id' => $entry->user_id],
            ['total_points' => 0, 'predictions_made' => 0, 'correct_predictions' => 0, 'current_streak' => 0, 'best_streak' => 0, 'streak_bonus_points' => 0, 'match_result_correct' => 0, 'double_chance_correct' => 0, 'correct_score_correct' => 0]
        );

        $standing->total_points += $entry->points_earned;
        $standing->predictions_made += 1;

        if ($entry->is_correct) {
            $standing->correct_predictions += 1;

            match ($entry->prediction_type) {
                'match_result' => $standing->match_result_correct += 1,
                'double_chance' => $standing->double_chance_correct += 1,
                'correct_score' => $standing->correct_score_correct += 1,
            };
        }

        $standing->save();
    }

    /**
     * Update gameweek standings.
     */
    private function updateGameweekStandings(PredictionEntry $entry, int $gameweekId): void
    {
        $gwStanding = PredictionGameweekStanding::firstOrCreate(
            ['gameweek_id' => $gameweekId, 'user_id' => $entry->user_id],
            ['points' => 0, 'predictions_made' => 0, 'correct_predictions' => 0]
        );

        $gwStanding->points += $entry->points_earned;
        $gwStanding->predictions_made += 1;
        if ($entry->is_correct) {
            $gwStanding->correct_predictions += 1;
        }
        $gwStanding->save();
    }

    /**
     * Update group standings for all groups the user belongs to in this org.
     */
    private function updateGroupStandings(PredictionEntry $entry, PredictionFixture $fixture): void
    {
        // Find all class_sets the user belongs to within this organization
        $classSetIds = ClassSetMember::where('user_id', $entry->user_id)
            ->whereHas('classSet.department.faculty', function ($q) use ($fixture) {
                $q->where('organization_id', $fixture->organization_id);
            })
            ->pluck('class_set_id');

        foreach ($classSetIds as $classSetId) {
            $groupStanding = PredictionGroupStanding::firstOrCreate(
                ['season_id' => $fixture->season_id, 'class_set_id' => $classSetId, 'user_id' => $entry->user_id],
                ['total_points' => 0, 'predictions_made' => 0, 'correct_predictions' => 0]
            );

            $groupStanding->total_points += $entry->points_earned;
            $groupStanding->predictions_made += 1;
            if ($entry->is_correct) {
                $groupStanding->correct_predictions += 1;
            }
            $groupStanding->save();
        }
    }

    /**
     * Recalculate streak for a user by looking at their most recent entries.
     */
    private function updateStreak(int $userId, int $seasonId): void
    {
        $standing = PredictionStanding::where('season_id', $seasonId)
            ->where('user_id', $userId)
            ->first();

        if (!$standing) return;

        // Get all scored entries for this user in this season, ordered newest first
        $entries = PredictionEntry::where('user_id', $userId)
            ->whereHas('fixture', fn($q) => $q->where('season_id', $seasonId)->where('status', 'completed'))
            ->whereNotNull('is_correct')
            ->orderByDesc('updated_at')
            ->get();

        $currentStreak = 0;
        foreach ($entries as $entry) {
            if ($entry->is_correct) {
                $currentStreak++;
            } else {
                break;
            }
        }

        $oldBestStreak = $standing->best_streak;
        $standing->current_streak = $currentStreak;
        $standing->best_streak = max($standing->best_streak, $currentStreak);

        // Streak bonuses: awarded once per milestone
        $bonusPoints = 0;
        $milestones = [3 => 3, 5 => 5, 10 => 10];
        foreach ($milestones as $milestone => $bonus) {
            // Award bonus if we just crossed this milestone (old streak was below, new is at or above)
            if ($currentStreak >= $milestone && $oldBestStreak < $milestone && $standing->best_streak >= $milestone) {
                $bonusPoints += $bonus;
            }
        }

        if ($bonusPoints > 0) {
            $standing->streak_bonus_points += $bonusPoints;
            $standing->total_points += $bonusPoints;
        }

        $standing->save();
    }

    /**
     * Check and award badges after scoring a fixture.
     */
    private function checkBadges(int $userId, PredictionFixture $fixture): void
    {
        $seasonId = $fixture->season_id;

        // Perfect Week: all gameweek predictions correct
        if ($fixture->gameweek_id) {
            $this->checkPerfectWeek($userId, $fixture->gameweek_id, $seasonId);
        }

        // Sharp Shooter: 5+ correct score predictions
        $this->checkSharpShooter($userId, $seasonId);

        // On Fire: 10+ consecutive correct
        $this->checkOnFire($userId, $seasonId);

        // Iron Defense: 10+ clean sheet predictions correct
        $this->checkIronDefense($userId, $seasonId);
    }

    private function checkPerfectWeek(int $userId, int $gameweekId, int $seasonId): void
    {
        $gwStanding = PredictionGameweekStanding::where('gameweek_id', $gameweekId)
            ->where('user_id', $userId)
            ->first();

        if (!$gwStanding || $gwStanding->predictions_made === 0) return;

        // Check if all fixtures in this gameweek are completed
        $totalGwFixtures = PredictionFixture::where('gameweek_id', $gameweekId)
            ->where('status', 'completed')
            ->count();
        $totalGwFixturesAll = PredictionFixture::where('gameweek_id', $gameweekId)
            ->whereIn('status', ['upcoming', 'live', 'completed'])
            ->count();

        // Only award if all non-cancelled fixtures are completed and user predicted all correctly
        if ($totalGwFixtures === $totalGwFixturesAll && $totalGwFixtures > 0
            && $gwStanding->predictions_made === $gwStanding->correct_predictions
            && $gwStanding->predictions_made >= $totalGwFixtures) {
            $this->awardBadge('perfect_week', $userId, $seasonId);
        }
    }

    private function checkSharpShooter(int $userId, int $seasonId): void
    {
        $standing = PredictionStanding::where('season_id', $seasonId)
            ->where('user_id', $userId)
            ->first();

        if ($standing && $standing->correct_score_correct >= 5) {
            $this->awardBadge('sharp_shooter', $userId, $seasonId);
        }
    }

    private function checkOnFire(int $userId, int $seasonId): void
    {
        $standing = PredictionStanding::where('season_id', $seasonId)
            ->where('user_id', $userId)
            ->first();

        if ($standing && $standing->current_streak >= 10) {
            $this->awardBadge('on_fire', $userId, $seasonId);
        }
    }

    private function checkIronDefense(int $userId, int $seasonId): void
    {
        // Count entries where user predicted a clean sheet and was correct
        $cleanSheetCorrect = PredictionEntry::where('user_id', $userId)
            ->where('is_correct', true)
            ->whereHas('fixture', function ($q) use ($seasonId) {
                $q->where('season_id', $seasonId)
                    ->where('status', 'completed')
                    ->where(function ($sq) {
                        $sq->where('home_score', 0)->orWhere('away_score', 0);
                    });
            })
            ->where(function ($q) {
                // User predicted a clean sheet result
                $q->where(function ($sq) {
                    $sq->where('prediction_type', 'correct_score')
                        ->where(function ($ssq) {
                            $ssq->where('predicted_home_score', 0)->orWhere('predicted_away_score', 0);
                        });
                });
            })
            ->count();

        if ($cleanSheetCorrect >= 10) {
            $this->awardBadge('iron_defense', $userId, $seasonId);
        }
    }

    private function awardBadge(string $slug, int $userId, int $seasonId): void
    {
        $badge = PredictionBadge::where('slug', $slug)->first();
        if (!$badge) return;

        $userBadge = PredictionUserBadge::where('badge_id', $badge->id)
            ->where('user_id', $userId)
            ->where('season_id', $seasonId)
            ->first();

        if ($userBadge) {
            $userBadge->increment('times_earned');
        } else {
            PredictionUserBadge::create([
                'badge_id' => $badge->id,
                'user_id' => $userId,
                'season_id' => $seasonId,
                'times_earned' => 1,
                'earned_at' => now(),
            ]);
        }
    }
}
