<?php

namespace Database\Seeders;

use App\Models\GuestModels\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TwoFamiliesUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Family 1: Johnson Family (6 members)
        $johnsonFamily = [
            // Parents
            [
                'first_name' => 'Michael',
                'last_name' => 'Johnson',
                'gender' => 'male',
                'username' => 'michael.johnson',
                'email' => 'michael.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1980-03-15',
            ],
            [
                'first_name' => 'Sarah',
                'last_name' => 'Johnson',
                'gender' => 'female',
                'username' => 'sarah.johnson',
                'email' => 'sarah.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1982-07-22',
            ],
            // Children (2 boys, 2 girls)
            [
                'first_name' => 'James',
                'last_name' => 'Johnson',
                'gender' => 'male',
                'username' => 'james.johnson',
                'email' => 'james.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2005-11-10',
            ],
            [
                'first_name' => 'Emily',
                'last_name' => 'Johnson',
                'gender' => 'female',
                'username' => 'emily.johnson',
                'email' => 'emily.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2008-02-18',
            ],
            [
                'first_name' => 'David',
                'last_name' => 'Johnson',
                'gender' => 'male',
                'username' => 'david.johnson',
                'email' => 'david.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2010-09-05',
            ],
            [
                'first_name' => 'Sophia',
                'last_name' => 'Johnson',
                'gender' => 'female',
                'username' => 'sophia.johnson',
                'email' => 'sophia.johnson@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2012-04-28',
            ],
        ];

        // Family 2: Williams Family (4 members)
        $williamsFamily = [
            // Parents
            [
                'first_name' => 'Robert',
                'last_name' => 'Williams',
                'gender' => 'male',
                'username' => 'robert.williams',
                'email' => 'robert.williams@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1978-12-08',
            ],
            [
                'first_name' => 'Jennifer',
                'last_name' => 'Williams',
                'gender' => 'female',
                'username' => 'jennifer.williams',
                'email' => 'jennifer.williams@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '1981-06-14',
            ],
            // Children (1 boy, 1 girl)
            [
                'first_name' => 'Daniel',
                'last_name' => 'Williams',
                'gender' => 'male',
                'username' => 'daniel.williams',
                'email' => 'daniel.williams@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2007-08-20',
            ],
            [
                'first_name' => 'Olivia',
                'last_name' => 'Williams',
                'gender' => 'female',
                'username' => 'olivia.williams',
                'email' => 'olivia.williams@example.com',
                'password' => Hash::make('password123'),
                'date_of_birth' => '2010-01-12',
            ],
        ];

        // Seed Johnson Family
        foreach ($johnsonFamily as $member) {
            User::updateOrCreate(
                ['email' => $member['email']], // Search by email
                $member // Update or create with this data
            );
        }

        // Seed Williams Family
        foreach ($williamsFamily as $member) {
            User::updateOrCreate(
                ['email' => $member['email']], // Search by email
                $member // Update or create with this data
            );
        }
    }
}
