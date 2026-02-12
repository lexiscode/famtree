<?php

namespace App\Actions\GuestServices;

use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\ChildAccountRepository;
use App\Repositories\GuestRepositories\UserConnectionRepository;
use App\Helpers\RelationshipInferenceHelper;
use Illuminate\Support\Str;

class ChildAccountService
{
    public function __construct(
        private ChildAccountRepository $childAccountRepository,
        private UserConnectionRepository $connectionRepository,
    ) {}

    /**
     * Create a child account
     * Only users 18+ can create child accounts
     */
    public function createChildAccount(int $parentId, array $childData): array
    {
        // Verify parent is 18+
        $parent = User::findOrFail($parentId);

        if (!$this->isParentEligible($parent)) {
            throw new \Exception('Parent must be 18 or older to create a child account.');
        }

        // Generate temporary password
        $temporaryPassword = Str::random(12);

        // Prepare child account data
        $accountData = [
            'first_name' => $childData['first_name'],
            'last_name' => $childData['last_name'],
            'username' => $childData['username'],
            'gender' => $childData['gender'],
            'date_of_birth' => $childData['date_of_birth'],
            'email' => null, // Will be set when child comes of age
            'password' => bcrypt($temporaryPassword),
            'parent_user_id' => $parentId,
            'is_child_account' => true,
            'created_by_user_id' => $parentId,
            'status' => 'alive', // Child is alive when account is created
        ];

        // Create child account
        $childAccount = $this->childAccountRepository->createChildAccount($accountData);

        // Auto-create connection: parent → child based on parent and child genders
        $relationshipType = $this->determineRelationshipType($parent->gender, $childAccount->gender);

        $otherParentId = $childData['other_parent_id'] ?? null;

        $this->connectionRepository->createConnection([
            'requester_user_id' => $parentId,
            'recipient_user_id' => $childAccount->id,
            'relationship_type' => $relationshipType,
            'other_parent_id' => $otherParentId,
            'status' => 'accepted',
            'requested_at' => now(),
            'accepted_at' => now(),
        ]);

        // Auto-connect child with all of parent's existing connections
        $this->autoConnectChildWithParentConnections($parent, $childAccount, $otherParentId);

        return [
            'child_account' => $childAccount,
            'temporary_password' => $temporaryPassword,
            'username' => $childAccount->username,
            'message' => 'Child account created successfully. Share the temporary password with your child to log in.',
        ];
    }

    /**
     * Auto-connect a new child with all of the parent's existing connections
     *
     * This creates appropriate family relationships based on the parent's relationships:
     * - Parent's parents → grandparents of child (child is grandchild)
     * - Parent's siblings → aunts/uncles of child (child is niece/nephew)
     * - Parent's spouse → parent of child (child is son/daughter)
     * - Parent's other children → siblings of child (child is brother/sister)
     * - Parent's nieces/nephews → cousins of child
     */
    private function autoConnectChildWithParentConnections(User $parent, User $child, ?int $otherParentId = null): void
    {
        // Get all accepted connections of the parent
        $parentConnections = $this->connectionRepository->getConnections($parent->id);

        foreach ($parentConnections as $connection) {
            // Determine who the connected person is
            $connectedUserId = $connection->requester_user_id === $parent->id
                ? $connection->recipient_user_id
                : $connection->requester_user_id;

            // Skip if this is the child itself (shouldn't happen, but safety check)
            if ($connectedUserId === $child->id) {
                continue;
            }

            // Skip divorced spouses — a new child should not auto-connect with an ex-spouse
            if ($connection->isDivorced() && in_array($connection->relationship_type, ['wife', 'husband', 'partner'])) {
                continue;
            }

            // Get the relationship type from the parent's perspective
            $parentRelationshipType = $connection->requester_user_id === $parent->id
                ? $connection->relationship_type
                : $this->getInverseRelationshipType($connection->relationship_type, $connection->requester, $connection->recipient);

            // Check if this relationship type should trigger auto-connection
            if (!RelationshipInferenceHelper::shouldAutoConnect($parentRelationshipType)) {
                continue;
            }

            // Get the connected user for gender context
            $connectedUser = User::find($connectedUserId);
            if (!$connectedUser) {
                continue;
            }

            // Infer what relationship the child has with this person
            $childRelationshipType = RelationshipInferenceHelper::inferChildRelationship(
                $parentRelationshipType,
                $child->gender,
                $connectedUser->gender
            );

            // Skip if no relationship could be inferred
            if (!$childRelationshipType) {
                continue;
            }

            // Check if connection already exists (shouldn't happen for new child, but safety check)
            if ($this->connectionRepository->connectionExists($connectedUserId, $child->id, $childRelationshipType)) {
                continue;
            }

            // Create the connection (from the connected person's perspective to the child)
            // The connected person is the "requester" and the child is the "recipient"
            // This way, the relationship_type represents what the child is TO the connected person
            $connectionData = [
                'requester_user_id' => $connectedUserId,
                'recipient_user_id' => $child->id,
                'relationship_type' => $childRelationshipType,
                'status' => 'accepted',
                'requested_at' => now(),
                'accepted_at' => now(),
            ];

            // If this connected person is the other parent (spouse), set other_parent_id
            // to the creating parent so the spouse-to-child connection also tracks the pair
            if ($otherParentId && $connectedUserId === $otherParentId
                && in_array($parentRelationshipType, ['wife', 'husband', 'partner'])) {
                $connectionData['other_parent_id'] = $parent->id;
            }

            $this->connectionRepository->createConnection($connectionData);
        }
    }

    /**
     * Get inverse relationship type for determining parent's perspective
     */
    private function getInverseRelationshipType(string $relationshipType, ?User $requester, ?User $recipient): string
    {
        $requesterGender = $requester?->gender;
        $recipientGender = $recipient?->gender;

        // Handle parent-child relationships
        if ($relationshipType === 'son' || $relationshipType === 'daughter') {
            return $requesterGender === 'male' ? 'father' : 'mother';
        }
        if ($relationshipType === 'father' || $relationshipType === 'mother') {
            return $requesterGender === 'male' ? 'son' : 'daughter';
        }

        // Handle sibling relationships
        if ($relationshipType === 'brother' || $relationshipType === 'sister') {
            return $requesterGender === 'male' ? 'brother' : 'sister';
        }

        // Handle spouse relationships
        if ($relationshipType === 'husband') return 'wife';
        if ($relationshipType === 'wife') return 'husband';
        if ($relationshipType === 'partner') return 'partner';

        // Handle grandparent-grandchild
        if ($relationshipType === 'grandson' || $relationshipType === 'granddaughter') {
            return $requesterGender === 'male' ? 'grandfather' : 'grandmother';
        }
        if ($relationshipType === 'grandfather' || $relationshipType === 'grandmother') {
            return $requesterGender === 'male' ? 'grandson' : 'granddaughter';
        }

        // Handle aunt/uncle - niece/nephew
        if ($relationshipType === 'nephew' || $relationshipType === 'niece') {
            return $requesterGender === 'male' ? 'uncle' : 'aunt';
        }
        if ($relationshipType === 'uncle' || $relationshipType === 'aunt') {
            return $requesterGender === 'male' ? 'nephew' : 'niece';
        }

        // Handle cousin (symmetric)
        if ($relationshipType === 'cousin') return 'cousin';

        // Default: return the same type
        return $relationshipType;
    }

    /**
     * Check if parent is eligible (18+)
     */
    public function isParentEligible(User $parent): bool
    {
        if (!$parent->date_of_birth) {
            return false;
        }

        $age = now()->diffInYears($parent->date_of_birth);
        return $age >= 18;
    }

    /**
     * Get all child accounts for a parent
     */
    public function getParentChildAccounts(int $parentId): array
    {
        $childAccounts = $this->childAccountRepository->getChildAccounts($parentId);

        return $childAccounts->map(fn($child) => [
            'id' => $child->id,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'full_name' => $child->first_name . ' ' . $child->last_name,
            'username' => $child->username,
            'gender' => $child->gender,
            'email' => $child->email,
            'date_of_birth' => $child->date_of_birth,
            'profile_image_url' => $child->profile_image_url,
            'status' => $child->status,
            'age' => $child->date_of_birth ? now()->diffInYears($child->date_of_birth) : null,
            'created_at' => $child->created_at,
        ])->toArray();
    }

    /**
     * Remove a child account and its associated connection
     */
    public function removeChildAccount(int $parentId, int $childId): bool
    {
        // Verify the child belongs to this parent
        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child || $child->parent_user_id !== $parentId) {
            throw new \Exception('Unauthorized: Child account does not belong to this parent.');
        }

        // Delete the connection between parent and child
        $this->connectionRepository->deleteConnectionBetween($parentId, $childId);

        // Delete the child account
        return $this->childAccountRepository->removeChildAccount($childId);
    }

    /**
     * Set email for a child when they come of age
     * Child must be 18+ to set their own email
     */
    public function setChildEmailAtAge(int $childId, string $newEmail): array
    {
        $child = User::findOrFail($childId);

        // Verify child is actually a child account
        if (!$child->is_child_account) {
            throw new \Exception('This is not a child account.');
        }

        // Verify child is 18+
        if (!$child->date_of_birth) {
            throw new \Exception('Date of birth is required to set email.');
        }

        $age = now()->diffInYears($child->date_of_birth);
        if ($age < 18) {
            throw new \Exception('Child must be 18 years old to set their own email.');
        }

        // Check if email is already taken
        if ($this->emailExists($newEmail, $childId)) {
            throw new \Exception('Email is already taken.');
        }

        // Update child's email
        $child->email = $newEmail;
        $child->save();

        return [
            'success' => true,
            'message' => 'Email has been set successfully.',
            'child' => [
                'id' => $child->id,
                'username' => $child->username,
                'email' => $child->email,
            ],
        ];
    }

    /**
     * Check if email exists (excluding the given user)
     */
    private function emailExists(string $email, int $excludeUserId): bool
    {
        return User::where('email', $email)
            ->where('id', '!=', $excludeUserId)
            ->exists();
    }

    /**
     * Validate child account creation data
     */
    public function validateChildAccountData(array $data): array
    {
        $errors = [];

        // Validate first name
        if (empty($data['first_name'])) {
            $errors['first_name'] = 'First name is required.';
        }

        // Validate last name
        if (empty($data['last_name'])) {
            $errors['last_name'] = 'Last name is required.';
        }

        // Validate username
        if (empty($data['username'])) {
            $errors['username'] = 'Username is required.';
        } elseif (!$this->childAccountRepository->isUsernameAvailable($data['username'])) {
            $errors['username'] = 'Username is already taken.';
        } elseif (strlen($data['username']) < 3) {
            $errors['username'] = 'Username must be at least 3 characters.';
        }

        // Validate date of birth
        if (empty($data['date_of_birth'])) {
            $errors['date_of_birth'] = 'Date of birth is required.';
        }

        return $errors;
    }

    /**
     * Check if user can manage child accounts
     */
    public function canManageChildAccounts(User $user): bool
    {
        return $this->isParentEligible($user);
    }

    /**
     * Get child account with parent info
     */
    public function getChildAccountDetails(int $childId): ?array
    {
        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child) {
            return null;
        }

        $parent = $this->childAccountRepository->getParent($childId);

        return [
            'id' => $child->id,
            'first_name' => $child->first_name,
            'last_name' => $child->last_name,
            'full_name' => $child->first_name . ' ' . $child->last_name,
            'username' => $child->username,
            'gender' => $child->gender,
            'email' => $child->email,
            'date_of_birth' => $child->date_of_birth,
            'age' => $child->date_of_birth ? now()->diffInYears($child->date_of_birth) : null,
            'profile_image_url' => $child->profile_image_url,
            'status' => $child->status,
            'created_at' => $child->created_at,
            'parent' => $parent ? [
                'id' => $parent->id,
                'first_name' => $parent->first_name,
                'last_name' => $parent->last_name,
                'username' => $parent->username,
            ] : null,
        ];
    }

    /**
     * Determine the relationship type based on parent and child genders
     * Parent perspective:
     *   - Male parent → "father"
     *   - Female parent → "mother"
     * Child perspective:
     *   - Male child → "son"
     *   - Female child → "daughter"
     */
    private function determineRelationshipType(?string $parentGender, ?string $childGender): string
    {
        // Determine based on child's gender (what the child is called from parent's perspective)
        // Parent's gender doesn't matter for this determination
        if ($childGender === 'male') {
            return 'son';
        } elseif ($childGender === 'female') {
            return 'daughter';
        }

        // Default to "son" only if child's gender is missing/unknown
        return 'son';
    }
}
