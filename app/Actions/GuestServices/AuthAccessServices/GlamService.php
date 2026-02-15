<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Repositories\GuestRepositories\AuthAccessRepositories\GlamRepository;
use App\Models\GuestModels\User;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class GlamService
{
    public function __construct(private GlamRepository $repository) {}

    /**
     * Get main glam squad page data.
     */
    public function getGlamData(int $userId, ?int $seasonId = null): array
    {
        $user = User::find($userId);
        $season = $seasonId ? $this->repository->findSeason($seasonId) : $this->repository->getActiveSeason();

        if (!$season) {
            return [
                'season' => null,
                'currentChallenge' => null,
                'challenges' => [],
                'pastChallenges' => [],
                'userSquad' => null,
                'userMixedSquad' => null,
                'isFollowing' => $this->repository->isFollowing($userId),
                'userBadges' => [],
                'allBadges' => $this->formatBadges(),
                'seasons' => $this->repository->getAllSeasons()->map(fn($s) => [
                    'id' => $s->id, 'name' => $s->name, 'status' => $s->status,
                ]),
            ];
        }

        $currentChallenge = $this->repository->getCurrentChallenge($season->id);
        $genderedMembership = $this->repository->getUserGenderedSquad($userId);
        $mixedMembership = $this->repository->getUserMixedSquad($userId);

        $userEntry = null;
        $userVoteCount = 0;
        if ($currentChallenge) {
            $userEntry = $this->repository->getUserEntry($currentChallenge->id, $userId);
            $userVoteCount = $this->repository->getUserVoteCount($currentChallenge->id, $userId);
        }

        $userStanding = $this->repository->getUserStanding($season->id, $userId);

        return [
            'season' => [
                'id' => $season->id,
                'name' => $season->name,
                'status' => $season->status,
                'start_date' => $season->start_date->format('Y-m-d'),
                'end_date' => $season->end_date->format('Y-m-d'),
            ],
            'currentChallenge' => $currentChallenge ? $this->formatChallenge($currentChallenge) : null,
            'challenges' => $season->challenges->map(fn($c) => $this->formatChallenge($c)),
            'pastChallenges' => $this->repository->getChallengeHistory($season->id)->map(fn($c) => $this->formatChallenge($c)),
            'userSquad' => $genderedMembership ? [
                'id' => $genderedMembership->squad->id,
                'uuid' => $genderedMembership->squad->uuid,
                'name' => $genderedMembership->squad->name,
                'gender_track' => $genderedMembership->squad->gender_track,
                'member_count' => $genderedMembership->squad->getMemberCount(),
            ] : null,
            'userMixedSquad' => $mixedMembership ? [
                'id' => $mixedMembership->squad->id,
                'uuid' => $mixedMembership->squad->uuid,
                'name' => $mixedMembership->squad->name,
                'member_count' => $mixedMembership->squad->getMemberCount(),
            ] : null,
            'userEntry' => $userEntry ? [
                'id' => $userEntry->id,
                'photo_1' => $userEntry->photo_1 ? Storage::url($userEntry->photo_1) : null,
                'photo_2' => $userEntry->photo_2 ? Storage::url($userEntry->photo_2) : null,
                'caption' => $userEntry->caption,
                'avg_rating' => $userEntry->avg_rating,
                'vote_count' => $userEntry->vote_count,
                'rank' => $userEntry->rank,
            ] : null,
            'userVoteCount' => $userVoteCount,
            'userStanding' => $userStanding ? [
                'total_points' => $userStanding->total_points,
                'challenges_entered' => $userStanding->challenges_entered,
                'current_entry_streak' => $userStanding->current_entry_streak,
            ] : null,
            'isFollowing' => $this->repository->isFollowing($userId),
            'userGender' => $user->gender ?? null,
            'userBadges' => $this->repository->getUserBadges($userId)->map(fn($ub) => [
                'badge' => $ub->badge ? [
                    'name' => $ub->badge->name,
                    'slug' => $ub->badge->slug,
                    'icon' => $ub->badge->icon,
                    'color' => $ub->badge->color,
                    'description' => $ub->badge->description,
                ] : null,
                'times_earned' => $ub->times_earned,
                'earned_at' => $ub->earned_at->format('Y-m-d'),
            ]),
            'allBadges' => $this->formatBadges(),
            'seasons' => $this->repository->getAllSeasons()->map(fn($s) => [
                'id' => $s->id, 'name' => $s->name, 'status' => $s->status,
            ]),
        ];
    }

    /**
     * Join a gendered squad.
     */
    public function joinSquad(int $userId, string $genderTrack): array
    {
        // Check user doesn't already have a gendered squad
        $existing = $this->repository->getUserGenderedSquad($userId);
        if ($existing) {
            return ['success' => false, 'message' => 'You are already in a squad'];
        }

        $squad = $this->repository->findNextAvailableSquad($genderTrack);

        if (!$squad) {
            // Create new squad
            $num = $this->repository->getNextSquadNumber($genderTrack);
            $label = ucfirst($genderTrack);
            $squad = $this->repository->createSquad([
                'uuid' => Str::uuid()->toString(),
                'name' => "{$label} Squad {$num}",
                'gender_track' => $genderTrack,
                'squad_number' => $num,
            ]);
        }

        $this->repository->addMember($squad->id, $userId);

        return ['success' => true, 'message' => "You've joined {$squad->name}!"];
    }

    /**
     * Join a mixed squad.
     */
    public function joinMixedSquad(int $userId): array
    {
        $existing = $this->repository->getUserMixedSquad($userId);
        if ($existing) {
            return ['success' => false, 'message' => 'You are already in a mixed squad'];
        }

        $squad = $this->repository->findNextAvailableSquad('mixed');

        if (!$squad) {
            $num = $this->repository->getNextSquadNumber('mixed');
            $squad = $this->repository->createSquad([
                'uuid' => Str::uuid()->toString(),
                'name' => "Mixed Squad {$num}",
                'gender_track' => 'mixed',
                'squad_number' => $num,
            ]);
        }

        $this->repository->addMember($squad->id, $userId);

        return ['success' => true, 'message' => "You've joined {$squad->name}!"];
    }

    /**
     * Leave a squad.
     */
    public function leaveSquad(int $userId, int $squadId): array
    {
        $removed = $this->repository->removeMember($squadId, $userId);
        return [
            'success' => $removed,
            'message' => $removed ? "You've left the squad" : 'Could not leave squad',
        ];
    }

    /**
     * Submit a challenge entry.
     */
    public function submitEntry(int $userId, int $challengeId, array $data): array
    {
        $challenge = $this->repository->findChallenge($challengeId);
        if (!$challenge || !$challenge->isSubmissionsOpen()) {
            return ['success' => false, 'message' => 'Submissions are not open for this challenge'];
        }

        // Check user has a gendered squad
        $membership = $this->repository->getUserGenderedSquad($userId);
        if (!$membership) {
            return ['success' => false, 'message' => 'You must join a squad first'];
        }

        // Check no existing entry
        $existing = $this->repository->getUserEntry($challengeId, $userId);
        if ($existing) {
            return ['success' => false, 'message' => 'You have already submitted an entry'];
        }

        // Handle photo uploads
        $photo1Path = null;
        $photo2Path = null;

        if (isset($data['photo_1'])) {
            $photo1Path = $data['photo_1']->store('glam/entries', 'public');
        }
        if (isset($data['photo_2'])) {
            $photo2Path = $data['photo_2']->store('glam/entries', 'public');
        }

        if (!$photo1Path) {
            return ['success' => false, 'message' => 'At least one photo is required'];
        }

        $entry = $this->repository->createEntry([
            'uuid' => Str::uuid()->toString(),
            'challenge_id' => $challengeId,
            'user_id' => $userId,
            'squad_id' => $membership->squad_id,
            'gender_track' => $membership->squad->gender_track,
            'photo_1' => $photo1Path,
            'photo_2' => $photo2Path,
            'caption' => $data['caption'] ?? null,
        ]);

        return ['success' => true, 'message' => 'Entry submitted successfully!'];
    }

    /**
     * Update an existing entry.
     */
    public function updateEntry(int $userId, int $entryId, array $data): array
    {
        $entry = \App\Models\GuestModels\GlamEntry::find($entryId);
        if (!$entry || $entry->user_id !== $userId) {
            return ['success' => false, 'message' => 'Entry not found'];
        }

        $challenge = $this->repository->findChallenge($entry->challenge_id);
        if (!$challenge || !$challenge->isSubmissionsOpen()) {
            return ['success' => false, 'message' => 'Submissions are closed'];
        }

        $updateData = [];

        if (isset($data['photo_1'])) {
            $updateData['photo_1'] = $data['photo_1']->store('glam/entries', 'public');
        }
        if (isset($data['photo_2'])) {
            $updateData['photo_2'] = $data['photo_2']->store('glam/entries', 'public');
        }
        if (isset($data['caption'])) {
            $updateData['caption'] = $data['caption'];
        }

        $this->repository->updateEntry($entryId, $updateData);

        return ['success' => true, 'message' => 'Entry updated successfully'];
    }

    /**
     * Get next entry for voting.
     */
    public function getNextEntryToVote(int $userId, int $challengeId): ?array
    {
        // Verify voter has no entry in this challenge (non-submitters only)
        $userEntry = $this->repository->getUserEntry($challengeId, $userId);
        if ($userEntry) {
            return null; // Submitters cannot vote
        }

        // Check if user is following or is a squad member
        $isFollowing = $this->repository->isFollowing($userId);
        $hasSquad = $this->repository->getUserGenderedSquad($userId) !== null;
        if (!$isFollowing && !$hasSquad) {
            return null; // Must be follower or member to vote
        }

        $entry = $this->repository->getNextVotableEntry($challengeId, $userId);
        if (!$entry) return null;

        return [
            'id' => $entry->id,
            'photo_1' => $entry->photo_1 ? Storage::url($entry->photo_1) : null,
            'photo_2' => $entry->photo_2 ? Storage::url($entry->photo_2) : null,
            'caption' => $entry->caption,
            'user' => $entry->user ? [
                'first_name' => $entry->user->first_name,
                'last_name' => $entry->user->last_name,
                'profile_image_url' => $entry->user->profile_image_url,
            ] : null,
        ];
    }

    /**
     * Cast a vote.
     */
    public function castVote(int $userId, int $entryId, int $stars): array
    {
        if ($stars < 1 || $stars > 5) {
            return ['success' => false, 'message' => 'Stars must be between 1 and 5'];
        }

        $entry = \App\Models\GuestModels\GlamEntry::find($entryId);
        if (!$entry) {
            return ['success' => false, 'message' => 'Entry not found'];
        }

        if ($entry->user_id === $userId) {
            return ['success' => false, 'message' => 'You cannot vote on your own entry'];
        }

        if ($this->repository->hasVoted($entryId, $userId)) {
            return ['success' => false, 'message' => 'You have already voted on this entry'];
        }

        $this->repository->castVote($entryId, $userId, $stars);

        // Update entry stats
        $allVotes = $entry->votes()->pluck('stars');
        $entry->update([
            'avg_rating' => round($allVotes->avg(), 2),
            'vote_count' => $allVotes->count(),
        ]);

        return ['success' => true, 'message' => 'Vote submitted!'];
    }

    /**
     * Toggle follow status.
     */
    public function toggleFollow(int $userId): array
    {
        if ($this->repository->isFollowing($userId)) {
            $this->repository->unfollow($userId);
            return ['success' => true, 'following' => false, 'message' => 'Unfollowed Glam Squad'];
        } else {
            $this->repository->follow($userId);
            return ['success' => true, 'following' => true, 'message' => 'Now following Glam Squad!'];
        }
    }

    /**
     * Get challenge results.
     */
    public function getChallengeResults(int $challengeId, string $track): array
    {
        $challenge = $this->repository->findChallenge($challengeId);
        if (!$challenge) return [];

        // Get ALL entries for this track — qualified (ranked) first, then unqualified by votes
        $entries = $this->repository->getChallengeEntriesByTrack($challengeId, $track)
            ->sortBy([
                fn($a, $b) => ($a->is_qualified ? 0 : 1) <=> ($b->is_qualified ? 0 : 1),
                fn($a, $b) => ($a->rank ?? PHP_INT_MAX) <=> ($b->rank ?? PHP_INT_MAX),
                fn($a, $b) => $b->vote_count <=> $a->vote_count,
            ])
            ->values();

        return [
            'challenge' => $this->formatChallenge($challenge),
            'entries' => $entries->map(fn($e) => [
                'id' => $e->id,
                'rank' => $e->rank,
                'is_qualified' => (bool) $e->is_qualified,
                'photo_1' => $e->photo_1 ? Storage::url($e->photo_1) : null,
                'photo_2' => $e->photo_2 ? Storage::url($e->photo_2) : null,
                'caption' => $e->caption,
                'avg_rating' => $e->avg_rating,
                'vote_count' => $e->vote_count,
                'weighted_score' => $e->weighted_score,
                'user' => $e->user ? [
                    'id' => $e->user->id,
                    'first_name' => $e->user->first_name,
                    'last_name' => $e->user->last_name,
                    'username' => $e->user->username,
                    'profile_image_url' => $e->user->profile_image_url,
                ] : null,
            ]),
        ];
    }

    /**
     * Get leaderboard standings.
     */
    public function getStandings(int $seasonId, string $genderTrack): array
    {
        $standings = $this->repository->getStandings($seasonId, $genderTrack);
        return $standings->map(fn($s, $index) => [
            'rank' => $index + 1,
            'user' => $s->user ? [
                'id' => $s->user->id,
                'first_name' => $s->user->first_name,
                'last_name' => $s->user->last_name,
                'username' => $s->user->username,
                'profile_image_url' => $s->user->profile_image_url,
            ] : null,
            'total_points' => $s->total_points,
            'challenges_entered' => $s->challenges_entered,
            'top_1_count' => $s->top_1_count,
            'top_3_count' => $s->top_3_count,
            'current_entry_streak' => $s->current_entry_streak,
        ])->toArray();
    }

    /**
     * Get winners for feed sidebar.
     */
    public function getWinners(): array
    {
        return $this->repository->getLatestWinners()->toArray();
    }

    // ── Private Helpers ──

    private function formatChallenge($challenge): array
    {
        return [
            'id' => $challenge->id,
            'uuid' => $challenge->uuid,
            'title' => $challenge->title,
            'description' => $challenge->description,
            'theme' => $challenge->theme,
            'banner_image' => $challenge->banner_image ? Storage::url($challenge->banner_image) : null,
            'status' => $challenge->status,
            'challenge_number' => $challenge->challenge_number,
            'submissions_open_at' => $challenge->submissions_open_at?->toISOString(),
            'submissions_close_at' => $challenge->submissions_close_at?->toISOString(),
            'voting_open_at' => $challenge->voting_open_at?->toISOString(),
            'voting_close_at' => $challenge->voting_close_at?->toISOString(),
            'results_at' => $challenge->results_at?->toISOString(),
            'entries_count' => $challenge->entries()->count(),
        ];
    }

    private function formatBadges(): array
    {
        return $this->repository->getAllBadges()->map(fn($b) => [
            'slug' => $b->slug,
            'name' => $b->name,
            'description' => $b->description,
            'icon' => $b->icon,
            'color' => $b->color,
        ])->toArray();
    }
}
