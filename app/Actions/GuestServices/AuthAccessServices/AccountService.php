<?php

namespace App\Actions\GuestServices\AuthAccessServices;

use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

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

    /**
     * Soft delete the user account
     * Account will be permanently deleted after 30 days if not restored
     */
    public function deleteAccount(User $user): void
    {
        $scheduledDeletionDate = Carbon::now()->addDays(30);

        $user->update([
            'scheduled_deletion_at' => $scheduledDeletionDate,
        ]);

        $user->delete();
    }

    /**
     * Restore a soft-deleted user account
     */
    public function restoreAccount(User $user): void
    {
        $user->update([
            'scheduled_deletion_at' => null,
        ]);

        $user->restore();
    }
}
