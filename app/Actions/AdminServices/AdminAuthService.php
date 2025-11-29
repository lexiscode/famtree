<?php

namespace App\Actions\AdminServices;

use App\Models\AdminModels\Admin;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AdminAuthService
{
    /**
     * Authenticate an admin user
     *
     * @param string $email
     * @param string $password
     * @return Admin
     * @throws \Exception
     */
    public function login(string $email, string $password): Admin
    {
        $admin = Admin::where('email', $email)->first();

        if (!$admin || !Hash::check($password, $admin->password)) {
            throw new \Exception('Invalid email or password.');
        }

        if (!$admin->is_active) {
            throw new \Exception('This admin account is inactive.');
        }

        return $admin;
    }

    /**
     * Send password reset link to admin
     *
     * @param string $email
     * @return string
     * @throws \Exception
     */
    public function sendPasswordResetLink(string $email): string
    {
        $admin = Admin::where('email', $email)->first();

        if (!$admin) {
            throw new \Exception('No admin account found with this email address.');
        }

        // Use the admin password broker
        $broker = Password::broker('admins');
        $response = $broker->sendResetLink(['email' => $email]);

        if ($response !== Password::RESET_LINK_SENT) {
            throw new \Exception('Failed to send password reset link. Please try again.');
        }

        return $response;
    }

    /**
     * Reset admin password using token
     *
     * @param array $credentials
     * @return Admin
     * @throws \Exception
     */
    public function resetPassword(array $credentials): Admin
    {
        $broker = Password::broker('admins');

        $response = $broker->reset(
            $credentials,
            function (Admin $admin, $password) {
                $admin->password = Hash::make($password);
                $admin->save();
            }
        );

        if ($response !== Password::PASSWORD_RESET) {
            throw new \Exception('Failed to reset password. The reset link may have expired.');
        }

        return Admin::where('email', $credentials['email'])->first();
    }

    /**
     * Log out an admin user
     *
     * @return void
     */
    public function logout(): void
    {
        Auth::guard('admin')->logout();
    }

    /**
     * Update admin's last login timestamp
     *
     * @param Admin $admin
     * @return void
     */
    public function updateLastLogin(Admin $admin): void
    {
        $admin->update(['last_login_at' => now()]);
    }
}
