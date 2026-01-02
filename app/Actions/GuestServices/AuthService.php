<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\UserRepository;
use App\Models\GuestModels\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(private UserRepository $userRepository)
    {
    }

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

        // Create user
        $user = $this->userRepository->create([
            'first_name' => $data['firstName'],
            'last_name' => $data['lastName'],
            'username' => $data['username'],
            'email' => $data['email'],
            'gender' => $data['gender'],
            'password' => Hash::make($data['password']),
        ]);

        return $user;
    }

    /**
     * Authenticate user login
     */
    public function login(string $emailOrUsername, string $password): User
    {
        // Try to find user by email first, then by username
        $user = $this->userRepository->findByEmail($emailOrUsername);

        if (!$user) {
            $user = $this->userRepository->findByUsername($emailOrUsername);
        }

        // Check if user exists and password is correct
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'emailOrUsername' => ['Invalid email/username or password.'],
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
