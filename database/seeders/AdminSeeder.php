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
        // Create a default super admin user for testing
        Admin::firstOrCreate(
            ['email' => 'admin@famtree.test'],
            [
                'username' => 'admin',
                'email' => 'admin@famtree.test',
                'password' => Hash::make('AdminPassword123'),
                'phone' => '+1234567890',
                'role' => 'super_admin',
                'permissions' => json_encode(['*']),
                'is_active' => true,
            ]
        );

        // Create a moderator admin user
        Admin::firstOrCreate(
            ['email' => 'moderator@famtree.test'],
            [
                'username' => 'moderator',
                'email' => 'moderator@famtree.test',
                'password' => Hash::make('ModeratorPassword123'),
                'phone' => '+1234567891',
                'role' => 'moderator',
                'permissions' => json_encode([
                    'view_users',
                    'view_reports',
                    'approve_reports',
                    'view_analytics',
                ]),
                'is_active' => true,
            ]
        );

        // Create an editor admin user
        Admin::firstOrCreate(
            ['email' => 'editor@famtree.test'],
            [
                'username' => 'editor',
                'email' => 'editor@famtree.test',
                'password' => Hash::make('EditorPassword123'),
                'phone' => '+1234567892',
                'role' => 'editor',
                'permissions' => json_encode([
                    'view_users',
                    'view_analytics',
                ]),
                'is_active' => true,
            ]
        );

        $this->command->info('Admin users seeded successfully!');
        $this->command->info('Default Admin: admin@famtree.test / AdminPassword123');
        $this->command->info('Default Moderator: moderator@famtree.test / ModeratorPassword123');
        $this->command->info('Default Editor: editor@famtree.test / EditorPassword123');
    }
}
