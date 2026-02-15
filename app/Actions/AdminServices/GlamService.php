<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\GlamRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class GlamService
{
    public function __construct(
        private GlamRepository $repository,
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
            'challenges_count' => $s->challenges_count,
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
            'challenges_count' => $season->challenges_count,
            'standings_count' => $season->standings_count,
            'challenges' => $season->challenges->map(fn($c) => [
                'id' => $c->id,
                'uuid' => $c->uuid,
                'title' => $c->title,
                'description' => $c->description,
                'theme' => $c->theme,
                'banner_image' => $c->banner_image,
                'status' => $c->status,
                'challenge_number' => $c->challenge_number,
                'submissions_open_at' => $c->submissions_open_at?->format('Y-m-d\TH:i'),
                'submissions_close_at' => $c->submissions_close_at?->format('Y-m-d\TH:i'),
                'voting_open_at' => $c->voting_open_at?->format('Y-m-d\TH:i'),
                'voting_close_at' => $c->voting_close_at?->format('Y-m-d\TH:i'),
                'results_at' => $c->results_at?->format('Y-m-d\TH:i'),
                'entries_count' => $c->entries()->count(),
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
            $this->logActivity('create_glam_season', 'GlamSeason', $season->id, "Created glam season: {$season->name}");
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
                $this->logActivity('update_glam_season', 'GlamSeason', $id, "Updated glam season: {$season->name}");
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
                $this->logActivity('activate_glam_season', 'GlamSeason', $id, "Activated glam season: {$season->name}");
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
                $this->logActivity('complete_glam_season', 'GlamSeason', $id, "Completed glam season: {$season->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Challenge CRUD ──

    public function createChallenge(int $seasonId, array $data): bool
    {
        try {
            $data['uuid'] = Str::uuid()->toString();
            $data['season_id'] = $seasonId;
            if (!isset($data['challenge_number'])) {
                $data['challenge_number'] = $this->repository->getNextChallengeNumber($seasonId);
            }

            if (isset($data['banner_image_file'])) {
                $path = $data['banner_image_file']->store('glam/banners', 'public');
                $data['banner_image'] = $path;
                unset($data['banner_image_file']);
            }

            $challenge = $this->repository->createChallenge($data);
            $this->logActivity('create_glam_challenge', 'GlamChallenge', $challenge->id, "Created glam challenge: {$challenge->title}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function updateChallenge(int $id, array $data): bool
    {
        try {
            if (isset($data['banner_image_file'])) {
                $path = $data['banner_image_file']->store('glam/banners', 'public');
                $data['banner_image'] = $path;
                unset($data['banner_image_file']);
            }

            $challenge = $this->repository->updateChallenge($id, $data);
            if ($challenge) {
                $this->logActivity('update_glam_challenge', 'GlamChallenge', $id, "Updated glam challenge: {$challenge->title}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function transitionChallenge(int $id, string $status): bool
    {
        try {
            $challenge = $this->repository->updateChallenge($id, ['status' => $status]);
            if ($challenge) {
                $this->logActivity('transition_glam_challenge', 'GlamChallenge', $id, "Transitioned challenge to {$status}: {$challenge->title}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Squads ──

    public function getAllSquads(): array
    {
        $squads = $this->repository->getAllSquads();
        return $squads->map(fn($s) => [
            'id' => $s->id,
            'uuid' => $s->uuid,
            'name' => $s->name,
            'gender_track' => $s->gender_track,
            'squad_number' => $s->squad_number,
            'member_cap' => $s->member_cap,
            'members_count' => $s->members_count,
            'is_active' => $s->is_active,
        ])->toArray();
    }

    public function getSquadDetails(int $id): ?array
    {
        $squad = $this->repository->findSquad($id);
        if (!$squad) return null;

        return [
            'id' => $squad->id,
            'uuid' => $squad->uuid,
            'name' => $squad->name,
            'gender_track' => $squad->gender_track,
            'squad_number' => $squad->squad_number,
            'member_cap' => $squad->member_cap,
            'members_count' => $squad->members_count,
            'is_active' => $squad->is_active,
            'members' => $squad->members->map(fn($m) => [
                'id' => $m->id,
                'user_id' => $m->user_id,
                'user' => $m->user ? [
                    'id' => $m->user->id,
                    'first_name' => $m->user->first_name,
                    'last_name' => $m->user->last_name,
                    'username' => $m->user->username,
                    'profile_image_url' => $m->user->profile_image_url,
                ] : null,
                'is_admin' => $m->is_admin,
                'is_muted' => $m->is_muted,
                'joined_at' => $m->joined_at?->format('Y-m-d H:i'),
            ])->toArray(),
        ];
    }

    public function removeSquadMember(int $squadId, int $userId): bool
    {
        try {
            $removed = $this->repository->removeSquadMember($squadId, $userId);
            if ($removed) {
                $this->logActivity('remove_glam_squad_member', 'GlamSquadMember', $userId, "Removed user #{$userId} from squad #{$squadId}");
            }
            return $removed;
        } catch (\Exception $e) {
            return false;
        }
    }

    // ── Standings & Badges ──

    public function getSeasonStandings(int $seasonId, string $track): array
    {
        $standings = $this->repository->getSeasonStandings($seasonId, $track);
        return $standings->map(fn($s, $index) => [
            'rank' => $index + 1,
            'user_id' => $s->user_id,
            'user' => $s->user ? [
                'id' => $s->user->id,
                'first_name' => $s->user->first_name,
                'last_name' => $s->user->last_name,
                'username' => $s->user->username,
                'profile_image_url' => $s->user->profile_image_url,
            ] : null,
            'total_points' => $s->total_points,
            'challenges_entered' => $s->challenges_entered,
            'votes_cast' => $s->votes_cast,
            'top_1_count' => $s->top_1_count,
            'top_3_count' => $s->top_3_count,
            'current_entry_streak' => $s->current_entry_streak,
            'best_entry_streak' => $s->best_entry_streak,
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
            'total_challenges' => $this->repository->challengeCount(),
            'total_entries' => $this->repository->totalEntries(),
            'total_votes' => $this->repository->totalVotes(),
            'total_members' => $this->repository->totalMembers(),
        ];
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
