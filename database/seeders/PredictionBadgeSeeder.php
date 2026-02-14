<?php

namespace Database\Seeders;

use App\Models\GuestModels\PredictionBadge;
use Illuminate\Database\Seeder;

class PredictionBadgeSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'slug' => 'perfect_week',
                'name' => 'Perfect Week',
                'description' => 'All gameweek predictions correct',
                'icon' => 'star',
                'color' => '#FFD700',
            ],
            [
                'slug' => 'sharp_shooter',
                'name' => 'Sharp Shooter',
                'description' => '5 or more correct score predictions in a season',
                'icon' => 'target',
                'color' => '#EF4444',
            ],
            [
                'slug' => 'on_fire',
                'name' => 'On Fire',
                'description' => '10 or more consecutive correct predictions',
                'icon' => 'flame',
                'color' => '#F97316',
            ],
            [
                'slug' => 'iron_defense',
                'name' => 'Iron Defense',
                'description' => '10 or more clean sheet predictions correct',
                'icon' => 'shield',
                'color' => '#3B82F6',
            ],
        ];

        foreach ($badges as $badge) {
            PredictionBadge::updateOrCreate(
                ['slug' => $badge['slug']],
                $badge
            );
        }
    }
}
