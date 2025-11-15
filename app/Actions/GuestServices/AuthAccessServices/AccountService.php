<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AccountService
{
    /**
     * Change the user's password
     */
    public function changePassword(User $user, string $newPassword): void
    {
        $user->update([
            'password' => Hash::make($newPassword),
        ]);
    }

    /**
     * Change the user's email address
     */
    public function changeEmail(User $user, string $newEmail): void
    {
        $user->update([
            'email' => $newEmail,
        ]);
    }
}
