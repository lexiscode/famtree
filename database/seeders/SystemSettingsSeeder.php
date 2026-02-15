<?php

namespace Database\Seeders;

use App\Models\AdminModels\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // General settings
            [
                'key' => 'app_name',
                'value' => 'FamTree',
                'group' => 'general',
                'description' => 'The name of the application',
                'is_editable' => true,
            ],
            [
                'key' => 'app_description',
                'value' => 'A modern family tree management platform',
                'group' => 'general',
                'description' => 'Brief description of the application',
                'is_editable' => true,
            ],
            [
                'key' => 'maintenance_mode',
                'value' => false,
                'group' => 'general',
                'description' => 'Enable or disable maintenance mode',
                'is_editable' => true,
            ],
            [
                'key' => 'app_timezone',
                'value' => 'UTC',
                'group' => 'general',
                'description' => 'Default application timezone',
                'is_editable' => true,
            ],

            // Content settings
            [
                'key' => 'max_post_length',
                'value' => 5000,
                'group' => 'content',
                'description' => 'Maximum character length for posts',
                'is_editable' => true,
            ],
            [
                'key' => 'max_gallery_size',
                'value' => 10,
                'group' => 'content',
                'description' => 'Maximum number of images per gallery upload (in MB)',
                'is_editable' => true,
            ],
            [
                'key' => 'max_profile_image_size',
                'value' => 5,
                'group' => 'content',
                'description' => 'Maximum profile image size (in MB)',
                'is_editable' => true,
            ],
            [
                'key' => 'allowed_image_types',
                'value' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                'group' => 'content',
                'description' => 'Allowed image file types for uploads',
                'is_editable' => true,
            ],

            // Registration & Auth settings
            [
                'key' => 'allow_registration',
                'value' => true,
                'group' => 'auth',
                'description' => 'Allow new user registrations',
                'is_editable' => true,
            ],
            [
                'key' => 'require_2fa',
                'value' => false,
                'group' => 'auth',
                'description' => 'Require two-factor authentication for all users',
                'is_editable' => true,
            ],
            [
                'key' => 'require_email_verification',
                'value' => false,
                'group' => 'auth',
                'description' => 'Require email verification before accessing the platform',
                'is_editable' => true,
            ],
            [
                'key' => 'max_login_attempts',
                'value' => 5,
                'group' => 'auth',
                'description' => 'Maximum failed login attempts before lockout',
                'is_editable' => true,
            ],
            [
                'key' => 'lockout_duration',
                'value' => 15,
                'group' => 'auth',
                'description' => 'Account lockout duration in minutes',
                'is_editable' => true,
            ],
            [
                'key' => 'password_min_length',
                'value' => 8,
                'group' => 'auth',
                'description' => 'Minimum password length',
                'is_editable' => true,
            ],

            // Notification settings
            [
                'key' => 'email_notifications_enabled',
                'value' => true,
                'group' => 'notifications',
                'description' => 'Enable email notifications',
                'is_editable' => true,
            ],
            [
                'key' => 'push_notifications_enabled',
                'value' => false,
                'group' => 'notifications',
                'description' => 'Enable push notifications',
                'is_editable' => true,
            ],

            // System settings
            [
                'key' => 'auto_cleanup_days',
                'value' => 90,
                'group' => 'system',
                'description' => 'Number of days before auto-cleanup of activity logs',
                'is_editable' => true,
            ],
            [
                'key' => 'max_child_accounts',
                'value' => 10,
                'group' => 'system',
                'description' => 'Maximum number of child accounts per user',
                'is_editable' => true,
            ],
            [
                'key' => 'max_connections_per_user',
                'value' => 500,
                'group' => 'system',
                'description' => 'Maximum number of connections per user',
                'is_editable' => true,
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::firstOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }

        $this->command->info('System settings seeded successfully!');
    }
}
