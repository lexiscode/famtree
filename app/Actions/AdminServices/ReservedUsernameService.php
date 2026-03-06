<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\ReservedUsernameRepository;
use App\Repositories\AdminRepositories\UserRepository;
use App\Models\AdminModels\ReservedUsername;
use App\Models\AdminActivityLog;
use App\Mail\UsernameReassignedMail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;

class ReservedUsernameService
{
    public function __construct(
        private ReservedUsernameRepository $repository,
        private UserRepository $userRepository
    ) {}

    public function getAll(int $perPage = 15, int $page = 1, string $search = '', string $status = '')
    {
        return $this->repository->getAllPaginated($perPage, $page, $search, $status)->through(fn($r) => [
            'id' => $r->id,
            'username' => $r->username,
            'celebrity_name' => $r->celebrity_name,
            'notes' => $r->notes,
            'status' => $r->status,
            'claimed_by' => $r->claimedByUser ? [
                'id' => $r->claimedByUser->id,
                'first_name' => $r->claimedByUser->first_name,
                'last_name' => $r->claimedByUser->last_name,
                'username' => $r->claimedByUser->username,
            ] : null,
            'claimed_at' => $r->claimed_at?->format('Y-m-d H:i:s'),
            'created_at' => $r->created_at->format('Y-m-d'),
        ]);
    }

    public function getStats(): array
    {
        return [
            'total' => $this->repository->count(),
            'reserved' => $this->repository->countByStatus('reserved'),
            'claimed' => $this->repository->countByStatus('claimed'),
        ];
    }

    public function create(array $data): ?ReservedUsername
    {
        try {
            $reserved = $this->repository->create([
                'username' => $data['username'],
                'celebrity_name' => $data['celebrity_name'],
                'notes' => $data['notes'] ?? null,
            ]);
            $this->logActivity('reserve_username', 'ReservedUsername', $reserved->id, "Reserved username: {$reserved->username} for {$reserved->celebrity_name}");
            return $reserved;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function update(int $id, array $data): bool
    {
        try {
            $reserved = $this->repository->update($id, $data);
            if ($reserved) {
                $this->logActivity('update_reserved_username', 'ReservedUsername', $id, "Updated reserved username: {$reserved->username}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function delete(int $id): bool
    {
        try {
            $reserved = $this->repository->find($id);
            if ($reserved) {
                $this->logActivity('delete_reserved_username', 'ReservedUsername', $id, "Deleted reserved username: {$reserved->username}");
                return $this->repository->delete($id);
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function reassignUsername(int $reservedId, string $targetUsername): array
    {
        try {
            $reserved = $this->repository->find($reservedId);
            if (!$reserved) {
                return ['success' => false, 'error' => 'Reserved username not found.'];
            }

            $targetUser = $this->userRepository->findByUsername($targetUsername);
            if (!$targetUser) {
                return ['success' => false, 'error' => 'Target user not found.'];
            }

            // Find the current holder of this username
            $currentHolder = $this->userRepository->findByUsername($reserved->username);

            if ($currentHolder) {
                // Generate a new username for the current holder
                $newUsername = $this->generateAlternativeUsername($reserved->username);
                $currentHolder->update(['username' => $newUsername]);

                $this->logActivity('reassign_username', 'User', $currentHolder->id, "Username changed from '{$reserved->username}' to '{$newUsername}' for celebrity reassignment");
            }

            // Assign the reserved username to the target user
            $targetUser->update(['username' => $reserved->username]);

            // Mark as claimed
            $this->repository->update($reservedId, [
                'status' => 'claimed',
                'claimed_by' => $targetUser->id,
                'claimed_at' => now(),
            ]);

            $this->logActivity('reassign_username', 'ReservedUsername', $reservedId, "Username '{$reserved->username}' reassigned to @{$targetUsername} (user #{$targetUser->id})");

            // Send confirmation email to the user about their new username
            Mail::to($targetUser->email)->send(new UsernameReassignedMail(
                fullName: $targetUser->first_name . ' ' . $targetUser->last_name,
                newUsername: $reserved->username,
                oldUsername: $targetUsername
            ));

            return [
                'success' => true,
                'previous_holder' => $currentHolder ? [
                    'id' => $currentHolder->id,
                    'old_username' => $reserved->username,
                    'new_username' => $currentHolder->fresh()->username,
                ] : null,
            ];
        } catch (\Exception $e) {
            return ['success' => false, 'error' => 'An error occurred during reassignment.'];
        }
    }

    private function generateAlternativeUsername(string $username): string
    {
        $suffix = 1;
        while ($this->userRepository->findByUsername($username . $suffix)) {
            $suffix++;
        }
        return $username . $suffix;
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {}
    }
}
