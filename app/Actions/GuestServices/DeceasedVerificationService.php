<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\User;
use App\Models\GuestModels\UserConnection;
use App\Repositories\GuestRepositories\DeceasedVerificationRepository;
use Illuminate\Database\Eloquent\Collection;

class DeceasedVerificationService
{
    /**
     * Tier 1: Nuclear family relationship types (contacted first).
     */
    protected array $nuclearFamilyTypes;

    /**
     * Tier 2: Extended family relationship types (fallback when no nuclear family available).
     */
    protected array $extendedFamilyTypes;

    public function __construct(
        protected DeceasedVerificationRepository $repository
    ) {
        $this->nuclearFamilyTypes = config('memorial.nuclear_family_types', [
            'wife', 'husband', 'father', 'mother',
            'son', 'daughter', 'brother', 'sister'
        ]);

        $this->extendedFamilyTypes = config('memorial.extended_family_types', [
            'grandfather', 'grandmother', 'grandson', 'granddaughter',
            'uncle', 'aunt', 'nephew', 'niece', 'cousin'
        ]);
    }

    /**
     * Find users who have been inactive for the specified number of months
     * and don't have an active verification process.
     */
    public function findInactiveUsers(int $months): Collection
    {
        return User::inactive($months)
            ->active() // Not already memorialized
            ->whereDoesntHave('deceasedVerifications', function ($query) {
                $query->pending();
            })
            ->get();
    }

    /**
     * Initiate the reengagement stage (Stage 1) for an inactive user.
     */
    public function initiateReengagement(User $user): DeceasedVerification
    {
        // Check if there's already an active verification
        $existing = $this->repository->getActiveVerificationForUser($user->id);
        if ($existing) {
            return $existing;
        }

        return $this->repository->createVerification($user->id, 'reengagement');
    }

    /**
     * Progress a verification from reengagement to family check (Stage 2).
     */
    public function progressToFamilyCheck(DeceasedVerification $verification): DeceasedVerification
    {
        return $this->repository->updateStage($verification, 'family_check', [
            'family_check_sent_at' => now(),
        ]);
    }

    /**
     * Get family connections for a user using tiered approach.
     * Tier 1: Nuclear family (contacted first)
     * Tier 2: Extended family (fallback when no active nuclear family available)
     *
     * Returns the appropriate tier based on availability of active family members.
     */
    public function getCloseFamilyConnections(int $userId): Collection
    {
        // Try Tier 1 (Nuclear family) first
        $nuclearFamily = $this->getFamilyConnectionsByTypes($userId, $this->nuclearFamilyTypes);

        // Filter to only include active (non-memorial) family members
        $activeNuclearFamily = $nuclearFamily->filter(function ($member) {
            return !$member->is_memorial;
        });

        // If we have active nuclear family members, use them
        if ($activeNuclearFamily->isNotEmpty()) {
            return $activeNuclearFamily;
        }

        // Fallback to Tier 2 (Extended family) if no active nuclear family
        $extendedFamily = $this->getFamilyConnectionsByTypes($userId, $this->extendedFamilyTypes);

        // Filter to only include active (non-memorial) extended family members
        return $extendedFamily->filter(function ($member) {
            return !$member->is_memorial;
        });
    }

    /**
     * Get family connections by specific relationship types.
     */
    protected function getFamilyConnectionsByTypes(int $userId, array $relationshipTypes): Collection
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($query) use ($userId) {
                $query->where('requester_user_id', $userId)
                      ->orWhere('recipient_user_id', $userId);
            })
            ->whereIn('relationship_type', $relationshipTypes)
            ->with(['requester:id,uuid,first_name,last_name,email,profile_image,is_memorial',
                    'recipient:id,uuid,first_name,last_name,email,profile_image,is_memorial'])
            ->get()
            ->map(function ($connection) use ($userId) {
                // Return the OTHER user in the connection (the family member)
                $familyMember = $connection->requester_user_id === $userId
                    ? $connection->recipient
                    : $connection->requester;

                // Attach relationship type for context
                if ($familyMember) {
                    $familyMember->relationship_to_inactive_user = $connection->relationship_type;
                }

                return $familyMember;
            })
            ->filter() // Remove any null values
            ->unique('id');
    }

    /**
     * Get all eligible family types (both tiers combined).
     */
    public function getAllFamilyTypes(): array
    {
        return array_merge($this->nuclearFamilyTypes, $this->extendedFamilyTypes);
    }

    /**
     * Record a family member's response to a status check.
     */
    public function recordResponse(
        DeceasedVerification $verification,
        User $responder,
        string $relationshipType,
        string $response
    ): void {
        // Check if already responded
        if ($this->repository->hasUserResponded($verification->id, $responder->id)) {
            throw new \Exception('You have already responded to this status check.');
        }

        $this->repository->addResponse(
            $verification->id,
            $responder->id,
            $relationshipType,
            $response
        );
    }

    /**
     * Calculate the majority response for a verification.
     * Returns 'alive', 'deceased', or null if not enough responses.
     */
    public function calculateMajority(DeceasedVerification $verification): ?string
    {
        $counts = $this->repository->getResponseCounts($verification->id);
        $minRequired = config('memorial.min_responses_required', 2);

        // Exclude 'unknown' responses from the calculation
        $validResponses = $counts['alive'] + $counts['deceased'];

        // Not enough valid responses yet
        if ($validResponses < $minRequired) {
            return null;
        }

        // Calculate majority
        if ($counts['deceased'] > $counts['alive']) {
            return 'deceased';
        } elseif ($counts['alive'] > $counts['deceased']) {
            return 'alive';
        }

        // Tie - no majority yet
        return null;
    }

    /**
     * Check if verification has enough responses to make a decision.
     */
    public function hasEnoughResponses(DeceasedVerification $verification): bool
    {
        $counts = $this->repository->getResponseCounts($verification->id);
        $minRequired = config('memorial.min_responses_required', 2);

        return ($counts['alive'] + $counts['deceased']) >= $minRequired;
    }

    /**
     * Schedule the status change after family confirms deceased.
     */
    public function scheduleStatusChange(DeceasedVerification $verification): DeceasedVerification
    {
        return $this->repository->scheduleStatusChange($verification);
    }

    /**
     * Execute the status change - mark user as deceased and enable memorial mode.
     */
    public function executeStatusChange(DeceasedVerification $verification, MemorialService $memorialService): void
    {
        $user = $verification->user;

        // Enable memorial mode on the user
        $memorialService->enableMemorial($user);

        // Complete the verification
        $this->repository->completeAsDeceased($verification);
    }

    /**
     * Cancel a verification if the user becomes active.
     */
    public function cancelVerification(DeceasedVerification $verification, string $reason): DeceasedVerification
    {
        return $this->repository->cancelVerification($verification, $reason);
    }

    /**
     * Handle user login - cancel any pending verification.
     */
    public function handleUserLogin(User $user): void
    {
        $pendingVerification = $this->repository->getActiveVerificationForUser($user->id);

        if ($pendingVerification) {
            $this->cancelVerification($pendingVerification, 'User logged in');
        }
    }

    /**
     * Check if a user can respond to a status check.
     */
    public function canUserRespond(DeceasedVerification $verification, User $responder): bool
    {
        // Check if the responder is close family of the inactive user
        $closeFamilyConnections = $this->getCloseFamilyConnections($verification->user_id);

        return $closeFamilyConnections->contains('id', $responder->id);
    }

    /**
     * Get the relationship type between responder and inactive user.
     */
    public function getResponderRelationship(int $inactiveUserId, int $responderId): ?string
    {
        $allFamilyTypes = $this->getAllFamilyTypes();

        $connection = UserConnection::where('status', 'accepted')
            ->where(function ($query) use ($inactiveUserId, $responderId) {
                $query->where(function ($q) use ($inactiveUserId, $responderId) {
                    $q->where('requester_user_id', $inactiveUserId)
                      ->where('recipient_user_id', $responderId);
                })->orWhere(function ($q) use ($inactiveUserId, $responderId) {
                    $q->where('requester_user_id', $responderId)
                      ->where('recipient_user_id', $inactiveUserId);
                });
            })
            ->whereIn('relationship_type', $allFamilyTypes)
            ->first();

        return $connection?->relationship_type;
    }

    /**
     * Get verifications ready to progress from reengagement to family check.
     */
    public function getVerificationsReadyForFamilyCheck(): Collection
    {
        return $this->repository->getReengagementVerificationsReadyForFamilyCheck();
    }

    /**
     * Get verifications ready to execute status change.
     */
    public function getVerificationsReadyForStatusChange(): Collection
    {
        return $this->repository->getPendingChangeVerificationsReady();
    }

    /**
     * Find verification by UUID.
     */
    public function findByUuid(string $uuid): ?DeceasedVerification
    {
        return $this->repository->findByUuid($uuid);
    }
}
