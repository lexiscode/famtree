<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\User;

class OAuthRepository
{
    /**
     * Find user by Google ID
     */
    public function findByGoogleId(string $googleId): ?User
    {
        return User::where('google_id', $googleId)->first();
    }

    /**
     * Find user by email (for linking)
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Link Google account to existing user
     */
    public function linkGoogleAccount(User $user, string $googleId): User
    {
        $user->update([
            'google_id' => $googleId,
            'oauth_provider' => 'google',
            'oauth_linked_at' => now(),
        ]);

        return $user->fresh();
    }

    /**
     * Create user from OAuth data
     */
    public function createFromOAuth(array $data): User
    {
        return User::create([
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'username' => $data['username'],
            'email' => $data['email'],
            'gender' => $data['gender'],
            'password' => $data['password'], // Already hashed
            'google_id' => $data['google_id'],
            'oauth_provider' => 'google',
            'oauth_linked_at' => now(),
            'email_verified_at' => now(), // Google-verified email
        ]);
    }

    /**
     * Check if username exists
     */
    public function usernameExists(string $username): bool
    {
        return User::where('username', $username)->exists();
    }

    /**
     * Generate unique username from name
     */
    public function generateUniqueUsername(string $firstName, string $lastName): string
    {
        // Start with lowercase concatenated name
        $baseUsername = strtolower($firstName . $lastName);

        // Remove spaces and special characters
        $baseUsername = preg_replace('/[^a-z0-9]/', '', $baseUsername);

        // Ensure minimum length of 3 characters
        if (strlen($baseUsername) < 3) {
            $baseUsername = $baseUsername . 'user';
        }

        // Check if username exists
        if (!$this->usernameExists($baseUsername)) {
            return $baseUsername;
        }

        // Add random numbers until unique
        $attempts = 0;
        do {
            $randomNumber = rand(100, 9999);
            $username = $baseUsername . $randomNumber;
            $attempts++;
        } while ($this->usernameExists($username) && $attempts < 10);

        return $username;
    }
}
