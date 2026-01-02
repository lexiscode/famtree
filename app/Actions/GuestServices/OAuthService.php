<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\OAuthRepository;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Contracts\User as SocialiteUser;

class OAuthService
{
    public function __construct(
        private OAuthRepository $oAuthRepository
    ) {}

    /**
     * Process Google OAuth callback
     * Returns: ['action' => 'login'|'complete', 'user' => User|null, 'oauth_data' => array|null]
     */
    public function processGoogleCallback(SocialiteUser $googleUser): array
    {
        $googleId = $googleUser->getId();
        $email = $googleUser->getEmail();

        // Check if user with this Google ID already exists
        $user = $this->oAuthRepository->findByGoogleId($googleId);

        if ($user) {
            // User exists with Google ID - direct login
            return [
                'action' => 'login',
                'user' => $user,
                'oauth_data' => null,
            ];
        }

        // Check if user with this email exists (for linking)
        $existingUser = $this->oAuthRepository->findByEmail($email);

        if ($existingUser) {
            // Link Google account to existing user and login
            $linkedUser = $this->oAuthRepository->linkGoogleAccount($existingUser, $googleId);

            return [
                'action' => 'login',
                'user' => $linkedUser,
                'oauth_data' => null,
            ];
        }

        // New user - prepare OAuth data for completion form
        $oAuthData = [
            'google_id' => $googleId,
            'email' => $email,
            'first_name' => $this->extractFirstName($googleUser->getName()),
            'last_name' => $this->extractLastName($googleUser->getName()),
            'avatar' => $googleUser->getAvatar(),
        ];

        return [
            'action' => 'complete',
            'user' => null,
            'oauth_data' => $oAuthData,
        ];
    }

    /**
     * Complete OAuth registration with missing data
     */
    public function completeOAuthRegistration(array $oAuthData, string $gender, string $password): User
    {
        // Generate unique username
        $username = $this->oAuthRepository->generateUniqueUsername(
            $oAuthData['first_name'],
            $oAuthData['last_name']
        );

        // Create user with all required data
        $user = $this->oAuthRepository->createFromOAuth([
            'first_name' => $oAuthData['first_name'],
            'last_name' => $oAuthData['last_name'],
            'username' => $username,
            'email' => $oAuthData['email'],
            'gender' => $gender,
            'password' => Hash::make($password),
            'google_id' => $oAuthData['google_id'],
        ]);

        return $user;
    }

    /**
     * Extract first name from full name
     */
    private function extractFirstName(?string $fullName): string
    {
        if (!$fullName) {
            return 'User';
        }

        $parts = explode(' ', trim($fullName));
        return $parts[0] ?? 'User';
    }

    /**
     * Extract last name from full name
     */
    private function extractLastName(?string $fullName): string
    {
        if (!$fullName) {
            return 'Account';
        }

        $parts = explode(' ', trim($fullName));

        // If only one name part, use it as last name too
        if (count($parts) === 1) {
            return $parts[0];
        }

        // Return everything after first name as last name
        return implode(' ', array_slice($parts, 1));
    }

    /**
     * Validate OAuth session data
     */
    public function validateOAuthSessionData(?array $oAuthData): bool
    {
        if (!$oAuthData) {
            return false;
        }

        $requiredFields = ['google_id', 'email', 'first_name', 'last_name'];

        foreach ($requiredFields as $field) {
            if (empty($oAuthData[$field])) {
                return false;
            }
        }

        return true;
    }
}
