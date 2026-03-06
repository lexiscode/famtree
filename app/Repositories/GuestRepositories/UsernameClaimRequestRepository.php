<?php

namespace App\Repositories\GuestRepositories;

use App\Models\AdminModels\UsernameClaimRequest;
use App\Models\AdminModels\ReservedUsername;

class UsernameClaimRequestRepository
{
    public function create(array $data): UsernameClaimRequest
    {
        return UsernameClaimRequest::create($data);
    }

    public function isUsernameReserved(string $username): bool
    {
        return ReservedUsername::where('username', $username)
            ->where('status', 'reserved')
            ->exists();
    }

    public function hasPendingRequest(string $username, string $email): bool
    {
        return UsernameClaimRequest::where('username', $username)
            ->where('email', $email)
            ->whereIn('status', ['pending', 'code_sent'])
            ->exists();
    }
}
