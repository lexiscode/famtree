<?php

namespace Database\Seeders;

use App\Models\AdminModels\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create a default admin user for testing
        Admin::firstOrCreate(
            ['email' => 'admin@famtree.test'],
            [
                'username' => 'admin',
                'email' => 'admin@famtree.test',
                'password' => Hash::make('AdminPassword123'),
            ]
        );

        // Create additional admin users
        Admin::firstOrCreate(
            ['email' => 'moderator@famtree.test'],
            [
                'username' => 'moderator',
                'email' => 'moderator@famtree.test',
                'password' => Hash::make('ModeratorPassword123'),
            ]
        );

        $this->command->info('Admin users seeded successfully!');
    }
}
