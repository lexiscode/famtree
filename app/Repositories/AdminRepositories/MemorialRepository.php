<?php
namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\User;
use Illuminate\Pagination\LengthAwarePaginator;

class MemorialRepository
{
    public function getVerificationsPaginated(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return DeceasedVerification::with(['user:id,first_name,last_name,username,profile_image', 'responses.responder:id,first_name,last_name,username'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function findVerification(int $id): ?DeceasedVerification
    {
        return DeceasedVerification::with(['user:id,first_name,last_name,username,email,profile_image,death_date,is_memorial', 'responses.responder:id,first_name,last_name,username'])->find($id);
    }

    public function updateVerification(int $id, array $data): ?DeceasedVerification
    {
        $v = DeceasedVerification::find($id);
        if ($v) { $v->update($data); }
        return $v;
    }

    public function getMemorializedUsers(int $perPage = 15, int $page = 1): LengthAwarePaginator
    {
        return User::where('is_memorial', true)
            ->orderBy('memorialized_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    public function countVerifications(): int { return DeceasedVerification::count(); }
    public function countPending(): int { return DeceasedVerification::whereNull('completed_at')->whereNull('cancelled_at')->count(); }
    public function countMemorialized(): int { return User::where('is_memorial', true)->count(); }
}
