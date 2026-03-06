<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\UsernameClaimRequestRepository;
use App\Mail\VerificationCodeMail;
use App\Mail\ClaimVerifiedMail;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UsernameClaimRequestService
{
    public function __construct(private UsernameClaimRequestRepository $repository) {}

    public function getAll(int $perPage = 15, int $page = 1, string $search = '', string $status = '')
    {
        return $this->repository->getAllPaginated($perPage, $page, $search, $status)->through(fn($r) => [
            'id' => $r->id,
            'username' => $r->username,
            'full_name' => $r->full_name,
            'email' => $r->email,
            'social_media_url' => $r->social_media_url,
            'message' => $r->message,
            'verification_code' => $r->verification_code,
            'status' => $r->status,
            'temp_username' => $r->temp_username,
            'admin_notes' => $r->admin_notes,
            'created_at' => $r->created_at->format('Y-m-d H:i'),
        ]);
    }

    public function getStats(): array
    {
        return [
            'total' => $this->repository->count(),
            'pending' => $this->repository->countByStatus('pending'),
            'code_sent' => $this->repository->countByStatus('code_sent'),
            'verified' => $this->repository->countByStatus('verified'),
            'rejected' => $this->repository->countByStatus('rejected'),
        ];
    }

    public function generateCode(int $id): ?string
    {
        $request = $this->repository->find($id);
        if (!$request || !in_array($request->status, ['pending', 'code_sent'])) {
            return null;
        }

        $code = 'FAMTREE-' . strtoupper(Str::random(8));

        $this->repository->update($id, [
            'verification_code' => $code,
            'status' => 'code_sent',
        ]);

        $this->logActivity('generate_claim_code', 'UsernameClaimRequest', $id, "Generated verification code for @{$request->username} claim by {$request->full_name}");

        return $code;
    }

    public function sendCode(int $id): bool
    {
        $request = $this->repository->find($id);
        if (!$request || $request->status !== 'code_sent' || !$request->verification_code) {
            return false;
        }

        Mail::to($request->email)->send(new VerificationCodeMail(
            fullName: $request->full_name,
            username: $request->username,
            verificationCode: $request->verification_code,
            socialMediaUrl: $request->social_media_url
        ));

        $this->logActivity('send_claim_code', 'UsernameClaimRequest', $id, "Sent verification code to {$request->email} for @{$request->username} claim");

        return true;
    }

    public function verify(int $id, ?string $adminNotes = null): bool
    {
        $request = $this->repository->find($id);
        if (!$request || $request->status !== 'code_sent') {
            return false;
        }

        $tempUsername = $request->username . '_' . strtolower(Str::random(5));

        $data = [
            'status' => 'verified',
            'temp_username' => $tempUsername,
        ];
        if ($adminNotes) {
            $data['admin_notes'] = $adminNotes;
        }

        $this->repository->update($id, $data);

        Mail::to($request->email)->send(new ClaimVerifiedMail(
            fullName: $request->full_name,
            username: $request->username,
            tempUsername: $tempUsername
        ));

        $this->logActivity('verify_claim_request', 'UsernameClaimRequest', $id, "Verified claim request for @{$request->username} by {$request->full_name}. Temp username: {$tempUsername}");

        return true;
    }

    public function reject(int $id, ?string $adminNotes = null): bool
    {
        $request = $this->repository->find($id);
        if (!$request || in_array($request->status, ['verified', 'rejected'])) {
            return false;
        }

        $data = ['status' => 'rejected'];
        if ($adminNotes) {
            $data['admin_notes'] = $adminNotes;
        }

        $this->repository->update($id, $data);
        $this->logActivity('reject_claim_request', 'UsernameClaimRequest', $id, "Rejected claim request for @{$request->username} by {$request->full_name}");

        return true;
    }

    public function delete(int $id): bool
    {
        return $this->repository->delete($id);
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
