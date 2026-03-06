<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\UsernameClaimRequestRepository;

class UsernameClaimRequestService
{
    public function __construct(private UsernameClaimRequestRepository $repository) {}

    public function submitRequest(array $data): array
    {
        if (!$this->repository->isUsernameReserved($data['username'])) {
            return ['success' => false, 'message' => 'This username is not in our reserved list.'];
        }

        if ($this->repository->hasPendingRequest($data['username'], $data['email'])) {
            return ['success' => false, 'message' => 'You already have a pending claim request for this username.'];
        }

        $this->repository->create($data);

        return ['success' => true, 'message' => 'Your claim request has been submitted. Our team will review it and contact you with verification instructions.'];
    }
}
