<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\GlamChallenge;
use App\Models\GuestModels\GlamEntry;
use App\Models\GuestModels\GlamVote;
use App\Models\GuestModels\GlamStanding;
use App\Models\GuestModels\GlamBadge;
use App\Models\GuestModels\GlamUserBadge;

class GlamScoringService
{
    /**
     * Score all entries for a completed challenge.
     */
    public function scoreChallenge(int $challengeId): void
    {
        $challenge = GlamChallenge::with('season')->find($challengeId);
        if (!$challenge) return;

        $seasonId = $challenge->season_id;

        // Score each gender track separately
        foreach (['female', 'male'] as $track) {
            $this->scoreTrack($challengeId, $seasonId, $track);
        }

        // Award voting points to all voters
        $this->awardVotingPoints($challengeId, $seasonId);

        // Check badges for all participants
        $this->checkAllBadges($challengeId, $seasonId);
    }

    /**
     * Score entries for a specific gender track.
     */
    private function scoreTrack(int $challengeId, int $seasonId, string $track): void
    {
        $entries = GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $track)
            ->get();

        if ($entries->isEmpty()) return;

        // 1. Recalculate avg_rating and vote_count from votes table (idempotent)
        foreach ($entries as $entry) {
            $votes = GlamVote::where('entry_id', $entry->id)->pluck('stars');
            $entry->update([
                'avg_rating' => $votes->count() > 0 ? round($votes->avg(), 2) : 0,
                'vote_count' => $votes->count(),
            ]);
        }

        // Refresh entries
        $entries = GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $track)
            ->get();

        // 2. Mark is_qualified where vote_count >= 5
        foreach ($entries as $entry) {
            $entry->update(['is_qualified' => $entry->vote_count >= 5]);
        }

        // 3. Calculate weighted_score for qualified entries
        $maxVotes = $entries->max('vote_count') ?: 1;

        foreach ($entries as $entry) {
            if ($entry->is_qualified) {
                $weighted = (0.7 * $entry->avg_rating) + (0.3 * ($entry->vote_count / $maxVotes) * 5);
                $entry->update(['weighted_score' => round($weighted, 2)]);
            } else {
                $entry->update(['weighted_score' => 0]);
            }
        }

        // 4. Rank qualified entries by weighted_score DESC
        $qualified = GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $track)
            ->where('is_qualified', true)
            ->orderByDesc('weighted_score')
            ->get();

        $rank = 1;
        foreach ($qualified as $entry) {
            $entry->update(['rank' => $rank]);
            $rank++;
        }

        // Set rank null for unqualified
        GlamEntry::where('challenge_id', $challengeId)
            ->where('gender_track', $track)
            ->where('is_qualified', false)
            ->update(['rank' => null]);

        // 5. Award points and update standings
        foreach ($entries as $entry) {
            $this->updateStandings($entry, $seasonId);
        }
    }

    /**
     * Update standings for a single entry.
     */
    private function updateStandings(GlamEntry $entry, int $seasonId): void
    {
        $standing = GlamStanding::firstOrCreate(
            ['season_id' => $seasonId, 'user_id' => $entry->user_id],
            [
                'gender_track' => $entry->gender_track,
                'total_points' => 0,
                'challenges_entered' => 0,
                'votes_cast' => 0,
                'top_1_count' => 0,
                'top_3_count' => 0,
                'current_entry_streak' => 0,
                'best_entry_streak' => 0,
                'streak_bonus_points' => 0,
            ]
        );

        // Entry points: +5 for submitting
        $points = 5;

        // Rating bonus: avg_rating × 3 (rounded)
        $points += round($entry->avg_rating * 3);

        // Top 3 bonuses
        if ($entry->is_qualified && $entry->rank !== null) {
            if ($entry->rank === 1) {
                $points += 25;
                $standing->top_1_count += 1;
                $standing->top_3_count += 1;
            } elseif ($entry->rank === 2) {
                $points += 15;
                $standing->top_3_count += 1;
            } elseif ($entry->rank === 3) {
                $points += 10;
                $standing->top_3_count += 1;
            }
        }

        $standing->total_points += $points;
        $standing->challenges_entered += 1;

        // Update entry streak
        $standing->current_entry_streak += 1;
        $standing->best_entry_streak = max($standing->best_entry_streak, $standing->current_entry_streak);

        // Streak bonuses
        $streakBonus = 0;
        if ($standing->current_entry_streak === 3) $streakBonus = 5;
        elseif ($standing->current_entry_streak === 5) $streakBonus = 10;
        elseif ($standing->current_entry_streak >= 7 && ($standing->current_entry_streak - 7) % 2 === 0) $streakBonus = 15;

        if ($streakBonus > 0) {
            $standing->streak_bonus_points += $streakBonus;
            $standing->total_points += $streakBonus;
        }

        $standing->save();
    }

    /**
     * Award voting points: +1 per vote cast.
     */
    private function awardVotingPoints(int $challengeId, int $seasonId): void
    {
        $voterCounts = GlamVote::whereHas('entry', fn($q) => $q->where('challenge_id', $challengeId))
            ->selectRaw('voter_id, COUNT(*) as vote_count')
            ->groupBy('voter_id')
            ->get();

        foreach ($voterCounts as $vc) {
            // Determine gender track from their squad membership or entry
            $entry = GlamEntry::where('challenge_id', $challengeId)->where('user_id', $vc->voter_id)->first();
            $genderTrack = $entry ? $entry->gender_track : 'female'; // Default, voters may not have entries

            // Try to get track from their squad
            $membership = \App\Models\GuestModels\GlamSquadMember::where('user_id', $vc->voter_id)
                ->whereHas('squad', fn($q) => $q->whereIn('gender_track', ['female', 'male']))
                ->with('squad')
                ->first();
            if ($membership) {
                $genderTrack = $membership->squad->gender_track;
            }

            $standing = GlamStanding::firstOrCreate(
                ['season_id' => $seasonId, 'user_id' => $vc->voter_id],
                [
                    'gender_track' => $genderTrack,
                    'total_points' => 0,
                    'challenges_entered' => 0,
                    'votes_cast' => 0,
                    'top_1_count' => 0,
                    'top_3_count' => 0,
                    'current_entry_streak' => 0,
                    'best_entry_streak' => 0,
                    'streak_bonus_points' => 0,
                ]
            );

            $standing->total_points += $vc->vote_count;
            $standing->votes_cast += $vc->vote_count;
            $standing->save();
        }
    }

    /**
     * Check and award badges.
     */
    private function checkAllBadges(int $challengeId, int $seasonId): void
    {
        $entries = GlamEntry::where('challenge_id', $challengeId)->get();

        foreach ($entries as $entry) {
            $this->checkBadges($entry->user_id, $seasonId, $challengeId);
        }
    }

    private function checkBadges(int $userId, int $seasonId, int $challengeId): void
    {
        // Fashionista: 5 entries in a season
        $entriesInSeason = GlamEntry::where('user_id', $userId)
            ->whereHas('challenge', fn($q) => $q->where('season_id', $seasonId))
            ->count();
        if ($entriesInSeason >= 5) {
            $this->awardBadge('fashionista', $userId, $seasonId);
        }

        // Crowd Favorite: 50+ votes on a single entry
        $maxVotes = GlamEntry::where('user_id', $userId)
            ->whereHas('challenge', fn($q) => $q->where('season_id', $seasonId))
            ->max('vote_count');
        if ($maxVotes >= 50) {
            $this->awardBadge('crowd_favorite', $userId, $seasonId);
        }

        // Top Model: win 1st place
        $hasWon = GlamEntry::where('user_id', $userId)
            ->where('rank', 1)
            ->where('is_qualified', true)
            ->whereHas('challenge', fn($q) => $q->where('season_id', $seasonId))
            ->exists();
        if ($hasWon) {
            $this->awardBadge('top_model', $userId, $seasonId);
        }

        // Style Streak: 5 consecutive entries
        $standing = GlamStanding::where('season_id', $seasonId)->where('user_id', $userId)->first();
        if ($standing && $standing->current_entry_streak >= 5) {
            $this->awardBadge('style_streak', $userId, $seasonId);
        }

        // Critic Eye: 100+ votes cast in season
        if ($standing && $standing->votes_cast >= 100) {
            $this->awardBadge('critic_eye', $userId, $seasonId);
        }

        // Rising Star: top 3 on first challenge
        $firstEntry = GlamEntry::where('user_id', $userId)
            ->whereHas('challenge', fn($q) => $q->where('season_id', $seasonId)->where('status', 'completed'))
            ->orderBy('created_at')
            ->first();
        if ($firstEntry && $firstEntry->challenge_id === $challengeId && $firstEntry->is_qualified && $firstEntry->rank && $firstEntry->rank <= 3) {
            $this->awardBadge('rising_star', $userId, $seasonId);
        }

        // Podium Regular: top 3 in 3 different challenges
        $podiumCount = GlamEntry::where('user_id', $userId)
            ->where('is_qualified', true)
            ->where('rank', '<=', 3)
            ->whereHas('challenge', fn($q) => $q->where('season_id', $seasonId))
            ->distinct('challenge_id')
            ->count('challenge_id');
        if ($podiumCount >= 3) {
            $this->awardBadge('podium_regular', $userId, $seasonId);
        }
    }

    private function awardBadge(string $slug, int $userId, int $seasonId): void
    {
        $badge = GlamBadge::where('slug', $slug)->first();
        if (!$badge) return;

        $userBadge = GlamUserBadge::where('badge_id', $badge->id)
            ->where('user_id', $userId)
            ->where('season_id', $seasonId)
            ->first();

        if ($userBadge) {
            $userBadge->increment('times_earned');
        } else {
            GlamUserBadge::create([
                'badge_id' => $badge->id,
                'user_id' => $userId,
                'season_id' => $seasonId,
                'times_earned' => 1,
                'earned_at' => now(),
            ]);
        }
    }
}
