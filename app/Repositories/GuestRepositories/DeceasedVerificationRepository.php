<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\DeceasedVerificationResponse;
use Illuminate\Support\Str;

class DeceasedVerificationRepository
{
    /**
     * Create a new verification for a user.
     */
    public function createVerification(int $userId, string $stage = 'reengagement'): DeceasedVerification
    {
        return DeceasedVerification::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $userId,
            'stage' => $stage,
            'reengagement_sent_at' => $stage === 'reengagement' ? now() : null,
        ]);
    }

    /**
     * Update the verification stage.
     */
    public function updateStage(DeceasedVerification $verification, string $stage, array $additionalData = []): DeceasedVerification
    {
        $data = array_merge(['stage' => $stage], $additionalData);
        $verification->update($data);
        return $verification->fresh();
    }

    /**
     * Add a response to a verification.
     */
    public function addResponse(
        int $verificationId,
        int $responderId,
        string $relationshipType,
        string $response
    ): DeceasedVerificationResponse {
        return DeceasedVerificationResponse::create([
            'verification_id' => $verificationId,
            'responder_id' => $responderId,
            'relationship_type' => $relationshipType,
            'response' => $response,
            'responded_at' => now(),
        ]);
    }

    /**
     * Get all responses for a verification.
     */
    public function getResponsesForVerification(int $verificationId): \Illuminate\Database\Eloquent\Collection
    {
        return DeceasedVerificationResponse::where('verification_id', $verificationId)
            ->with('responder:id,first_name,last_name,profile_image')
            ->get();
    }

    /**
     * Check if a user has already responded to a verification.
     */
    public function hasUserResponded(int $verificationId, int $userId): bool
    {
        return DeceasedVerificationResponse::where('verification_id', $verificationId)
            ->where('responder_id', $userId)
            ->exists();
    }

    /**
     * Get active verification for a user (not completed or cancelled).
     */
    public function getActiveVerificationForUser(int $userId): ?DeceasedVerification
    {
        return DeceasedVerification::forUser($userId)
            ->pending()
            ->first();
    }

    /**
     * Find verification by UUID.
     */
    public function findByUuid(string $uuid): ?DeceasedVerification
    {
        return DeceasedVerification::where('uuid', $uuid)->first();
    }

    /**
     * Cancel a verification.
     */
    public function cancelVerification(DeceasedVerification $verification, string $reason): DeceasedVerification
    {
        $verification->update([
            'stage' => 'cancelled',
            'cancelled_at' => now(),
            'cancelled_reason' => $reason,
            'final_status' => 'alive',
        ]);
        return $verification->fresh();
    }

    /**
     * Complete a verification as deceased.
     */
    public function completeAsDeceased(DeceasedVerification $verification): DeceasedVerification
    {
        $verification->update([
            'stage' => 'completed',
            'completed_at' => now(),
            'final_status' => 'deceased',
        ]);
        return $verification->fresh();
    }

    /**
     * Get all pending verifications (not completed or cancelled).
     */
    public function getPendingVerifications(): \Illuminate\Database\Eloquent\Collection
    {
        return DeceasedVerification::pending()
            ->with('user:id,uuid,first_name,last_name,email')
            ->get();
    }

    /**
     * Get verifications at a specific stage.
     */
    public function getVerificationsAtStage(string $stage): \Illuminate\Database\Eloquent\Collection
    {
        return DeceasedVerification::atStage($stage)
            ->with('user:id,uuid,first_name,last_name,email,last_active_at')
            ->get();
    }

    /**
     * Get verifications at reengagement stage that are ready for family check.
     * (User has been inactive for 12+ months total)
     */
    public function getReengagementVerificationsReadyForFamilyCheck(): \Illuminate\Database\Eloquent\Collection
    {
        return DeceasedVerification::atStage('reengagement')
            ->whereHas('user', function ($query) {
                $threshold = config('memorial.family_check_threshold', 12);
                $query->where('last_active_at', '<=', now()->subMonths($threshold))
                      ->orWhereNull('last_active_at');
            })
            ->with('user:id,uuid,first_name,last_name,email')
            ->get();
    }

    /**
     * Get verifications at pending_change stage where waiting period has passed.
     */
    public function getPendingChangeVerificationsReady(): \Illuminate\Database\Eloquent\Collection
    {
        $waitingDays = config('memorial.pending_change_days', 30);

        return DeceasedVerification::atStage('pending_change')
            ->where('status_change_scheduled_at', '<=', now())
            ->with('user:id,uuid,first_name,last_name,email')
            ->get();
    }

    /**
     * Schedule status change with waiting period.
     */
    public function scheduleStatusChange(DeceasedVerification $verification): DeceasedVerification
    {
        $waitingDays = config('memorial.pending_change_days', 30);

        $verification->update([
            'stage' => 'pending_change',
            'status_change_scheduled_at' => now()->addDays($waitingDays),
        ]);

        return $verification->fresh();
    }

    /**
     * Count responses by type for a verification.
     */
    public function getResponseCounts(int $verificationId): array
    {
        $responses = DeceasedVerificationResponse::where('verification_id', $verificationId)
            ->selectRaw("response, COUNT(*) as count")
            ->groupBy('response')
            ->pluck('count', 'response')
            ->toArray();

        return [
            'alive' => $responses['alive'] ?? 0,
            'deceased' => $responses['deceased'] ?? 0,
            'unknown' => $responses['unknown'] ?? 0,
            'total' => array_sum($responses),
        ];
    }
}
