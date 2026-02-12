<?php

namespace Database\Seeders;

use App\Models\GuestModels\Organization;
use App\Models\OrgModels\OrgAccount;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OrgAccountSeeder extends Seeder
{
    public function run(): void
    {
        $organizations = [
            [
                'slug' => 'university-of-lagos',
                'username' => 'unilag-admin',
                'email' => 'admin@unilag.famtree.test',
                'display_name' => 'UNILAG Admin',
            ],
            [
                'slug' => 'university-of-ibadan',
                'username' => 'ui-admin',
                'email' => 'admin@ui.famtree.test',
                'display_name' => 'UI Admin',
            ],
            [
                'slug' => 'chelsea-football-club',
                'username' => 'chelsea-admin',
                'email' => 'admin@chelsea.famtree.test',
                'display_name' => 'Chelsea FC Admin',
            ],
            [
                'slug' => 'manchester-united',
                'username' => 'manutd-admin',
                'email' => 'admin@manutd.famtree.test',
                'display_name' => 'Man Utd Admin',
            ],
            [
                'slug' => 'deeper-christian-life-ministry',
                'username' => 'deeperlife-admin',
                'email' => 'admin@deeperlife.famtree.test',
                'display_name' => 'Deeper Life Admin',
            ],
        ];

        foreach ($organizations as $orgData) {
            $org = Organization::where('slug', $orgData['slug'])->first();

            if (!$org) {
                $this->command->warn("Organization '{$orgData['slug']}' not found. Skipping...");
                continue;
            }

            OrgAccount::firstOrCreate(
                ['email' => $orgData['email']],
                [
                    'organization_id' => $org->id,
                    'username' => $orgData['username'],
                    'password' => Hash::make('OrgPassword123'),
                    'role' => 'owner',
                    'permissions' => json_encode(['*']),
                    'display_name' => $orgData['display_name'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Organization accounts seeded successfully!');
        $this->command->info('Default credentials: OrgPassword123');
        $this->command->info('UNILAG: admin@unilag.famtree.test');
        $this->command->info('UI: admin@ui.famtree.test');
        $this->command->info('Chelsea: admin@chelsea.famtree.test');
        $this->command->info('Man Utd: admin@manutd.famtree.test');
        $this->command->info('Deeper Life: admin@deeperlife.famtree.test');
    }
}
