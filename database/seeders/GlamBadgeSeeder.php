<?php

namespace Database\Seeders;

use App\Models\GuestModels\GlamBadge;
use Illuminate\Database\Seeder;

class GlamBadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'slug' => 'fashionista',
                'name' => 'Fashionista',
                'description' => '5 entries in a single season',
                'icon' => 'shirt',
                'color' => '#EC4899',
            ],
            [
                'slug' => 'crowd_favorite',
                'name' => 'Crowd Favorite',
                'description' => '50+ votes on a single entry',
                'icon' => 'heart',
                'color' => '#EF4444',
            ],
            [
                'slug' => 'top_model',
                'name' => 'Top Model',
                'description' => 'Win 1st place in a challenge',
                'icon' => 'crown',
                'color' => '#FFD700',
            ],
            [
                'slug' => 'style_streak',
                'name' => 'Style Streak',
                'description' => '5 consecutive challenge entries',
                'icon' => 'flame',
                'color' => '#F97316',
            ],
            [
                'slug' => 'critic_eye',
                'name' => 'Critic Eye',
                'description' => '100+ votes cast in a season',
                'icon' => 'eye',
                'color' => '#8B5CF6',
            ],
            [
                'slug' => 'rising_star',
                'name' => 'Rising Star',
                'description' => 'Top 3 on your first challenge',
                'icon' => 'sparkles',
                'color' => '#06B6D4',
            ],
            [
                'slug' => 'season_champion',
                'name' => 'Season Champion',
                'description' => '1st place on seasonal leaderboard',
                'icon' => 'trophy',
                'color' => '#FBBF24',
            ],
            [
                'slug' => 'podium_regular',
                'name' => 'Podium Regular',
                'description' => 'Top 3 in 3 different challenges',
                'icon' => 'medal',
                'color' => '#10B981',
            ],
        ];

        foreach ($badges as $badge) {
            GlamBadge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }
}
