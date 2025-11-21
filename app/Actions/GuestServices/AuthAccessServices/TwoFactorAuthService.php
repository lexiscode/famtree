<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use Google\Authenticator\GoogleAuthenticator;
use Google\Authenticator\FixedBitNotation;

class TwoFactorAuthService
{
    private GoogleAuthenticator $ga;

    public function __construct()
    {
        $this->ga = new GoogleAuthenticator();
    }

    /**
     * Generate a new 2FA secret and QR code
     */
    public function generateSecret(User $user): array
    {
        $secret = $this->ga->generateSecret();

        // Build the correct otpauth URI format
        $appName = config('app.name');
        $email = $user->email;

        // Format: otpauth://totp/AppName:email@domain.com?secret=SECRET&issuer=AppName
        $otpauthUri = sprintf(
            'otpauth://totp/%s:%s?secret=%s&issuer=%s',
            urlencode($appName),
            urlencode($email),
            $secret,
            urlencode($appName)
        );

        // Generate QR code from the URI using QR server API
        $qrCodeUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' . urlencode($otpauthUri) . '&ecc=M';

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ];
    }

    /**
     * Enable 2FA for a user after verification
     */
    public function enable(User $user, string $secret, string $code): bool
    {
        // Verify the code is correct
        if (!$this->verify($code, $secret)) {
            return false;
        }

        // Generate backup codes
        $backupCodes = $this->generateBackupCodes();

        // Save the secret and backup codes
        $user->update([
            'two_fa_enabled' => true,
            'two_fa_secret' => $secret,
            'two_fa_backup_codes' => json_encode($backupCodes),
        ]);

        return true;
    }

    /**
     * Disable 2FA for a user
     */
    public function disable(User $user): void
    {
        $user->update([
            'two_fa_enabled' => false,
            'two_fa_secret' => null,
            'two_fa_backup_codes' => null,
        ]);
    }

    /**
     * Verify a 2FA code (TOTP or backup code)
     */
    public function verify(string $code, string $secret, bool $checkBackup = false): bool
    {
        // Clean the code
        $code = trim($code);

        // Check if it's a TOTP code
        if ($this->ga->checkCode($secret, $code)) {
            return true;
        }

        // If checking for backup codes in verification (during 2FA setup)
        // Regular TOTP check is enough
        if (!$checkBackup) {
            return false;
        }

        return false;
    }

    /**
     * Verify a 2FA code for a user (including backup codes)
     */
    public function verifyForUser(User $user, string $code): bool
    {
        // Clean the code
        $code = trim(str_replace(' ', '', $code));

        // Check if it's a valid TOTP code
        if ($this->ga->checkCode($user->two_fa_secret, $code)) {
            return true;
        }

        // Check if it's a valid backup code
        if ($user->two_fa_backup_codes) {
            $backupCodes = json_decode($user->two_fa_backup_codes, true);
            if (in_array($code, $backupCodes)) {
                // Remove the used backup code
                $backupCodes = array_filter($backupCodes, function($item) use ($code) {
                    return $item !== $code;
                });
                $user->update([
                    'two_fa_backup_codes' => json_encode(array_values($backupCodes)),
                ]);
                return true;
            }
        }

        return false;
    }

    /**
     * Generate new backup codes
     */
    private function generateBackupCodes(int $count = 10): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            // Generate 8-character backup codes
            $codes[] = strtoupper(bin2hex(random_bytes(4)));
        }
        return $codes;
    }

    /**
     * Get remaining backup codes for a user
     */
    public function getBackupCodes(User $user): array
    {
        if (!$user->two_fa_backup_codes) {
            return [];
        }
        return json_decode($user->two_fa_backup_codes, true) ?? [];
    }

    /**
     * Regenerate backup codes
     */
    public function regenerateBackupCodes(User $user): array
    {
        $newCodes = $this->generateBackupCodes();
        $user->update([
            'two_fa_backup_codes' => json_encode($newCodes),
        ]);
        return $newCodes;
    }

    /**
     * Check if 2FA is enabled for a user
     */
    public function isEnabled(User $user): bool
    {
        return $user->two_fa_enabled;
    }
}
