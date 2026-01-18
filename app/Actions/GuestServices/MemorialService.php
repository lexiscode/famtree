<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\MemorialMessage;
use App\Models\GuestModels\User;
use App\Models\GuestModels\UserConnection;
use App\Repositories\GuestRepositories\MemorialMessageRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class MemorialService
{
    /**
     * Close family relationship types that can add memorial messages.
     */
    protected array $closeFamilyTypes;

    public function __construct(
        protected MemorialMessageRepository $repository
    ) {
        $this->closeFamilyTypes = config('memorial.close_family_types', [
            'wife', 'husband', 'father', 'mother',
            'son', 'daughter', 'brother', 'sister'
        ]);
    }

    /**
     * Enable memorial mode for a user.
     */
    public function enableMemorial(User $user, ?User $triggeredBy = null): User
    {
        $user->update([
            'is_memorial' => true,
            'memorialized_at' => now(),
            'memorialized_by' => $triggeredBy?->id,
            'status' => 'deceased',
            'death_date' => now(), // Set approximate death date
        ]);

        return $user->fresh();
    }

    /**
     * Disable memorial mode for a user (reactivation).
     */
    public function disableMemorial(User $user): User
    {
        $user->update([
            'is_memorial' => false,
            'memorialized_at' => null,
            'memorialized_by' => null,
            'status' => 'alive',
            'death_date' => null,
            'reactivation_token' => null,
            'reactivation_token_expires_at' => null,
        ]);

        return $user->fresh();
    }

    /**
     * Add a memorial message from a family member.
     */
    public function addMemorialMessage(User $deceased, User $author, string $message): MemorialMessage
    {
        // Verify author is close family
        if (!$this->canAddMemorialMessage($author, $deceased)) {
            throw new \Exception('Only close family members can add memorial messages.');
        }

        $relationshipType = $this->getRelationshipType($deceased->id, $author->id);

        return $this->repository->create(
            $deceased->id,
            $author->id,
            $relationshipType ?? 'family',
            $message
        );
    }

    /**
     * Update a memorial message.
     */
    public function updateMemorialMessage(MemorialMessage $message, User $editor, string $newContent): MemorialMessage
    {
        // Only the original author can edit
        if ($message->author_id !== $editor->id) {
            throw new \Exception('You can only edit your own memorial messages.');
        }

        return $this->repository->update($message, $newContent);
    }

    /**
     * Delete a memorial message.
     */
    public function deleteMemorialMessage(MemorialMessage $message, User $deleter): bool
    {
        // Only the original author can delete
        if ($message->author_id !== $deleter->id) {
            throw new \Exception('You can only delete your own memorial messages.');
        }

        return $this->repository->delete($message);
    }

    /**
     * Get all memorial messages for a deceased user.
     */
    public function getMemorialMessages(User $deceased): Collection
    {
        return $this->repository->getMessagesForUser($deceased->id);
    }

    /**
     * Check if a user can add a memorial message to a deceased user's profile.
     */
    public function canAddMemorialMessage(User $author, User $deceased): bool
    {
        // User must not be memorialized themselves
        if ($author->is_memorial) {
            return false;
        }

        // Check if author has a close family connection
        return UserConnection::where('status', 'accepted')
            ->where(function ($query) use ($deceased, $author) {
                $query->where(function ($q) use ($deceased, $author) {
                    $q->where('requester_user_id', $deceased->id)
                      ->where('recipient_user_id', $author->id);
                })->orWhere(function ($q) use ($deceased, $author) {
                    $q->where('requester_user_id', $author->id)
                      ->where('recipient_user_id', $deceased->id);
                });
            })
            ->whereIn('relationship_type', $this->closeFamilyTypes)
            ->exists();
    }

    /**
     * Get the relationship type between two users.
     */
    protected function getRelationshipType(int $userId1, int $userId2): ?string
    {
        $connection = UserConnection::where('status', 'accepted')
            ->where(function ($query) use ($userId1, $userId2) {
                $query->where(function ($q) use ($userId1, $userId2) {
                    $q->where('requester_user_id', $userId1)
                      ->where('recipient_user_id', $userId2);
                })->orWhere(function ($q) use ($userId1, $userId2) {
                    $q->where('requester_user_id', $userId2)
                      ->where('recipient_user_id', $userId1);
                });
            })
            ->first();

        return $connection?->relationship_type;
    }

    /**
     * Generate a reactivation token for a user.
     */
    public function generateReactivationToken(User $user): string
    {
        $token = Str::random(64);
        $expiryHours = config('memorial.reactivation_token_expiry', 24);

        $user->update([
            'reactivation_token' => hash('sha256', $token),
            'reactivation_token_expires_at' => now()->addHours($expiryHours),
        ]);

        return $token;
    }

    /**
     * Validate a reactivation token.
     */
    public function validateReactivationToken(string $token): ?User
    {
        $hashedToken = hash('sha256', $token);

        $user = User::where('reactivation_token', $hashedToken)
            ->where('reactivation_token_expires_at', '>', now())
            ->where('is_memorial', true)
            ->first();

        return $user;
    }

    /**
     * Reactivate a deceased user's account.
     */
    public function reactivateAccount(User $user): User
    {
        // Disable memorial mode
        $this->disableMemorial($user);

        // Update last active
        $user->update([
            'last_active_at' => now(),
        ]);

        return $user->fresh();
    }

    /**
     * Check if a user can request reactivation.
     * Rate limited to prevent abuse.
     */
    public function canRequestReactivation(User $user): bool
    {
        // Check if there's a recent unexpired token
        if ($user->reactivation_token && $user->reactivation_token_expires_at) {
            $cooldownHours = config('memorial.reactivation_request_cooldown', 1);
            $tokenCreatedAt = $user->reactivation_token_expires_at
                ->subHours(config('memorial.reactivation_token_expiry', 24));

            if ($tokenCreatedAt->diffInHours(now()) < $cooldownHours) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get close family members of a deceased user.
     */
    public function getCloseFamilyMembers(User $deceased): Collection
    {
        return UserConnection::where('status', 'accepted')
            ->where(function ($query) use ($deceased) {
                $query->where('requester_user_id', $deceased->id)
                      ->orWhere('recipient_user_id', $deceased->id);
            })
            ->whereIn('relationship_type', $this->closeFamilyTypes)
            ->with(['requester:id,uuid,first_name,last_name,email,profile_image',
                    'recipient:id,uuid,first_name,last_name,email,profile_image'])
            ->get()
            ->map(function ($connection) use ($deceased) {
                return $connection->requester_user_id === $deceased->id
                    ? $connection->recipient
                    : $connection->requester;
            })
            ->filter()
            ->unique('id');
    }
}
