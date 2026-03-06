<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\UserRepository;
use App\Repositories\AdminRepositories\ReservedUsernameRepository;
use App\Models\GuestModels\User;
use App\Models\AdminModels\Admin;
use App\Models\AdminModels\UsernameClaimRequest;
use App\Mail\ClaimantRegisteredMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private ReservedUsernameRepository $reservedUsernameRepository
    ) {}

    /**
     * Register a new user
     */
    public function register(array $data): User
    {
        // Validate that email doesn't exist
        if ($this->userRepository->emailExists($data['email'])) {
            throw ValidationException::withMessages([
                'email' => ['This email is already registered.'],
            ]);
        }

        // Validate that username doesn't exist
        if ($this->userRepository->usernameExists($data['username'])) {
            throw ValidationException::withMessages([
                'username' => ['This username is already taken.'],
            ]);
        }

        // Check if username is reserved for a celebrity
        if ($this->reservedUsernameRepository->isReserved($data['username'])) {
            throw ValidationException::withMessages([
                'username' => ['This username is reserved for a public figure.'],
            ]);
        }

        // Create user
        $user = $this->userRepository->create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'username' => $data['username'],
            'email' => $data['email'],
            'gender' => $data['gender'],
            'password' => Hash::make($data['password']),
        ]);

        // Check if this username matches a verified claim request's temp_username
        $claimRequest = UsernameClaimRequest::where('temp_username', $data['username'])
            ->where('status', 'verified')
            ->first();

        if ($claimRequest) {
            $admins = Admin::where('is_active', true)->get();
            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new ClaimantRegisteredMail(
                    claimantName: $claimRequest->full_name,
                    tempUsername: $claimRequest->temp_username,
                    reservedUsername: $claimRequest->username,
                    claimantEmail: $claimRequest->email
                ));
            }
        }

        return $user;
    }

    /**
     * Authenticate user login
     */
    public function login(string $emailOrUsername, string $password): User
    {
        // Try to find user by email first, then by username, then by phone number
        $user = $this->userRepository->findByEmail($emailOrUsername);

        if (!$user) {
            $user = $this->userRepository->findByUsername($emailOrUsername);
        }

        if (!$user) {
            $user = $this->userRepository->findByPhone($emailOrUsername);
        }

        // Check if user exists and password is correct
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'emailOrUsername' => ['Invalid email/username/phone or password.'],
            ]);
        }

        return $user;
    }

    /**
     * Get user data (without sensitive information)
     */
    public function getUserData(User $user): array
    {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
        ];
    }
}
