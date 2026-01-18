<?php

namespace App\Actions\GuestServices;

use App\Mail\AccountReactivationMail;
use App\Mail\FamilyStatusCheckMail;
use App\Mail\MemorialCreatedMail;
use App\Mail\ReengagementMail;
use App\Mail\StatusChangePendingMail;
use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Mail;

class MemorialEmailService
{
    /**
     * Send reengagement email to inactive user ("We miss you").
     */
    public function sendReengagementEmail(User $user): void
    {
        Mail::to($user->email)->send(new ReengagementMail($user));
    }

    /**
     * Send family status check email to a family member.
     */
    public function sendFamilyCheckEmail(
        User $familyMember,
        User $inactiveUser,
        DeceasedVerification $verification
    ): void {
        Mail::to($familyMember->email)->send(
            new FamilyStatusCheckMail($familyMember, $inactiveUser, $verification)
        );
    }

    /**
     * Send status change pending email to the inactive user.
     */
    public function sendStatusChangePendingEmail(User $user, DeceasedVerification $verification): void
    {
        Mail::to($user->email)->send(new StatusChangePendingMail($user, $verification));
    }

    /**
     * Send memorial created notification to family members.
     */
    public function sendMemorialCreatedEmail(User $familyMember, User $deceased): void
    {
        Mail::to($familyMember->email)->send(new MemorialCreatedMail($familyMember, $deceased));
    }

    /**
     * Send account reactivation email to a memorialized user.
     */
    public function sendReactivationEmail(User $user, string $token): void
    {
        Mail::to($user->email)->send(new AccountReactivationMail($user, $token));
    }

    /**
     * Send family check emails to all close family members.
     */
    public function sendFamilyCheckEmails(
        DeceasedVerification $verification,
        DeceasedVerificationService $verificationService
    ): int {
        $inactiveUser = $verification->user;
        $familyMembers = $verificationService->getCloseFamilyConnections($inactiveUser->id);

        $sentCount = 0;
        foreach ($familyMembers as $familyMember) {
            // Don't send to memorialized users
            if ($familyMember->is_memorial) {
                continue;
            }

            $this->sendFamilyCheckEmail($familyMember, $inactiveUser, $verification);
            $sentCount++;
        }

        return $sentCount;
    }

    /**
     * Send memorial created notifications to all close family members.
     */
    public function sendMemorialCreatedEmails(User $deceased, MemorialService $memorialService): int
    {
        $familyMembers = $memorialService->getCloseFamilyMembers($deceased);

        $sentCount = 0;
        foreach ($familyMembers as $familyMember) {
            // Don't send to memorialized users
            if ($familyMember->is_memorial) {
                continue;
            }

            $this->sendMemorialCreatedEmail($familyMember, $deceased);
            $sentCount++;
        }

        return $sentCount;
    }
}
