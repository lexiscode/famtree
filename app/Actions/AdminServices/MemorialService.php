<?php
namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\MemorialRepository;
use App\Models\AdminActivityLog;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Auth;

class MemorialService
{
    public function __construct(private MemorialRepository $repository) {}

    public function getAllVerifications(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getVerificationsPaginated($perPage, $page)->through(fn($v) => [
            'id' => $v->id, 'uuid' => $v->uuid, 'stage' => $v->stage, 'final_status' => $v->final_status,
            'user' => $v->user ? ['id' => $v->user->id, 'full_name' => "{$v->user->first_name} {$v->user->last_name}", 'username' => $v->user->username, 'profile_image_url' => $v->user->profile_image_url] : null,
            'responses_count' => $v->responses->count(),
            'completed_at' => $v->completed_at?->format('Y-m-d H:i:s'),
            'cancelled_at' => $v->cancelled_at?->format('Y-m-d H:i:s'),
            'created_at' => $v->created_at->format('Y-m-d'), 'created_at_formatted' => $v->created_at->diffForHumans(),
        ]);
    }

    public function getVerificationDetails(int $id): ?array
    {
        $v = $this->repository->findVerification($id);
        if (!$v) return null;
        return [
            'id' => $v->id, 'uuid' => $v->uuid, 'stage' => $v->stage, 'final_status' => $v->final_status,
            'reengagement_sent_at' => $v->reengagement_sent_at?->format('Y-m-d H:i:s'),
            'family_check_sent_at' => $v->family_check_sent_at?->format('Y-m-d H:i:s'),
            'status_change_scheduled_at' => $v->status_change_scheduled_at?->format('Y-m-d H:i:s'),
            'completed_at' => $v->completed_at?->format('Y-m-d H:i:s'),
            'cancelled_at' => $v->cancelled_at?->format('Y-m-d H:i:s'),
            'cancelled_reason' => $v->cancelled_reason,
            'user' => $v->user ? [
                'id' => $v->user->id, 'full_name' => "{$v->user->first_name} {$v->user->last_name}",
                'username' => $v->user->username, 'email' => $v->user->email,
                'profile_image_url' => $v->user->profile_image_url,
                'death_date' => $v->user->death_date?->format('Y-m-d'),
                'is_memorial' => $v->user->is_memorial,
            ] : null,
            'responses' => $v->responses->map(fn($r) => [
                'id' => $r->id, 'relationship_type' => $r->relationship_type, 'response' => $r->response,
                'responded_at' => $r->responded_at?->format('Y-m-d H:i:s'),
                'responder' => $r->responder ? ['id' => $r->responder->id, 'full_name' => "{$r->responder->first_name} {$r->responder->last_name}", 'username' => $r->responder->username] : null,
            ]),
            'created_at' => $v->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function cancelVerification(int $id, string $reason = ''): bool
    {
        try {
            $v = $this->repository->updateVerification($id, ['cancelled_at' => now(), 'cancelled_reason' => $reason ?: 'Cancelled by admin']);
            if ($v) { $this->logActivity('cancel_verification', 'DeceasedVerification', $id, "Cancelled verification #{$id}"); return true; }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function expediteVerification(int $id): bool
    {
        try {
            $v = $this->repository->updateVerification($id, ['status_change_scheduled_at' => now()]);
            if ($v) { $this->logActivity('expedite_verification', 'DeceasedVerification', $id, "Expedited verification #{$id}"); return true; }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function overrideDeceased(int $userId): bool
    {
        try {
            $user = User::find($userId);
            if ($user) {
                $user->update(['is_memorial' => true, 'memorialized_at' => now(), 'memorialized_by' => Auth::guard('admin')->id()]);
                $this->logActivity('override_deceased', 'User', $userId, "Admin override: marked user as deceased");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function overrideAlive(int $userId): bool
    {
        try {
            $user = User::find($userId);
            if ($user) {
                $user->update(['is_memorial' => false, 'memorialized_at' => null, 'memorialized_by' => null, 'death_date' => null]);
                $this->logActivity('override_alive', 'User', $userId, "Admin override: marked user as alive");
                return true;
            }
            return false;
        } catch (\Exception $e) { return false; }
    }

    public function getMemorializedUsers(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getMemorializedUsers($perPage, $page)->through(fn($u) => [
            'id' => $u->id, 'full_name' => "{$u->first_name} {$u->last_name}", 'username' => $u->username,
            'profile_image_url' => $u->profile_image_url, 'death_date' => $u->death_date?->format('Y-m-d'),
            'memorialized_at' => $u->memorialized_at?->format('Y-m-d H:i:s'),
        ]);
    }

    public function getStats(): array
    {
        return ['total_verifications' => $this->repository->countVerifications(), 'pending' => $this->repository->countPending(), 'memorialized' => $this->repository->countMemorialized()];
    }

    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            AdminActivityLog::create(['admin_id' => $admin?->id, 'action_type' => $actionType, 'resource_type' => $resourceType, 'resource_id' => $resourceId, 'description' => $description, 'ip_address' => request()->ip(), 'user_agent' => request()->userAgent()]);
        } catch (\Exception $e) {}
    }
}
