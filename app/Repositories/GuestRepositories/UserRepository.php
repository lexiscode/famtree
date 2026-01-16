<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\User;

class UserRepository
{
    /**
     * Find user by email
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Find user by username
     */
    public function findByUsername(string $username): ?User
    {
        return User::where('username', $username)->first();
    }

    /**
     * Find user by phone number
     */
    public function findByPhone(string $phone): ?User
    {
        return User::where('phone', $phone)->first();
    }

    /**
     * Find user by ID
     */
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Create a new user
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Check if email exists
     */
    public function emailExists(string $email): bool
    {
        return User::where('email', $email)->exists();
    }

    /**
     * Check if username exists
     */
    public function usernameExists(string $username): bool
    {
        return User::where('username', $username)->exists();
    }

    /**
     * Check if phone number exists
     */
    public function phoneExists(string $phone): bool
    {
        return User::where('phone', $phone)->exists();
    }
}
