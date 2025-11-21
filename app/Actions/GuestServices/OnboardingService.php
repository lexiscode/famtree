<?php

namespace App\Actions\GuestServices;

use App\Repositories\GuestRepositories\OnboardingRepository;
use App\Repositories\GuestRepositories\UserProfileRepository;
use Illuminate\Validation\ValidationException;

class OnboardingService
{
    public function __construct(
        private OnboardingRepository $onboardingRepository,
        private UserProfileRepository $userProfileRepository
    ) {
    }

    /**
     * Initialize onboarding for a new user
     */
    public function initializeOnboarding(int $userId): void
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        $this->onboardingRepository->initializeOnboarding($userId);
    }

    /**
     * Get current onboarding progress
     */
    public function getProgress(int $userId): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        $steps = $this->onboardingRepository->getUserOnboardingSteps($userId);
        $completedCount = $steps->where('is_completed', true)->count();
        $totalCount = $steps->count();
        $progressPercentage = $totalCount > 0 ? ($completedCount / $totalCount) * 100 : 0;

        return [
            'current_step' => $this->getCurrentStep($steps),
            'completed_count' => $completedCount,
            'total_count' => $totalCount,
            'progress_percentage' => $progressPercentage,
            'is_complete' => $this->onboardingRepository->isOnboardingComplete($userId),
        ];
    }

    /**
     * Get current active step
     */
    private function getCurrentStep($steps)
    {
        foreach ($steps as $step) {
            if (!$step->is_completed) {
                return $step->step_name;
            }
        }

        return 'complete';
    }

    /**
     * Save basic info step
     */
    public function saveBasicInfoStep(int $userId, array $data): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Validate required fields
        if (empty($data['first_name']) || empty($data['last_name'])) {
            throw ValidationException::withMessages([
                'first_name' => ['First name is required'],
                'last_name' => ['Last name is required'],
            ]);
        }

        // Update user profile
        $this->userProfileRepository->updateProfile($userId, [
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'phone' => $data['phone'] ?? null,
            'bio' => $data['bio'] ?? null,
            'date_of_birth' => $data['date_of_birth'] ?? null,
            'gender' => $data['gender'] ?? null,
        ]);

        // Complete the step
        $this->onboardingRepository->completeOnboardingStep($userId, 'basic_info', $data);

        return $this->getProgress($userId);
    }

    /**
     * Save family status step
     */
    public function saveFamilyStatusStep(int $userId, array $data): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Validate family_status
        $validStatuses = ['single', 'dating', 'married', 'divorced', 'widowed', 'prefer_not_to_say'];
        if (empty($data['family_status']) || !in_array($data['family_status'], $validStatuses)) {
            throw ValidationException::withMessages([
                'family_status' => ['Please select a valid family status'],
            ]);
        }

        // Save family info
        $familyData = [
            'user_id' => $userId,
            'family_status' => $data['family_status'],
            'number_of_siblings' => $data['number_of_siblings'] ?? null,
            'number_of_children' => $data['number_of_children'] ?? null,
        ];

        $this->onboardingRepository->saveFamilyInfo($userId, $familyData);

        // Complete the step
        $this->onboardingRepository->completeOnboardingStep($userId, 'family_status', $data);

        return $this->getProgress($userId);
    }

    /**
     * Save location info step
     */
    public function saveLocationInfoStep(int $userId, array $data): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Validate required fields
        if (empty($data['country'])) {
            throw ValidationException::withMessages([
                'country' => ['Country is required'],
            ]);
        }

        // Update user profile
        $this->userProfileRepository->updateProfile($userId, [
            'address' => $data['address'] ?? null,
        ]);

        // Get or create family info and update with location
        $familyInfo = $this->onboardingRepository->getFamilyInfo($userId) ?? new \stdClass();
        $familyData = [
            'city' => $data['city'] ?? null,
            'state_province' => $data['state_province'] ?? null,
            'country' => $data['country'],
        ];

        $this->onboardingRepository->saveFamilyInfo($userId, $familyData);

        // Complete the step
        $this->onboardingRepository->completeOnboardingStep($userId, 'location_info', $data);

        return $this->getProgress($userId);
    }

    /**
     * Save education and work step
     */
    public function saveEducationWorkStep(int $userId, array $data): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Save education and work info
        $familyData = [
            'education_level' => $data['education_level'] ?? null,
            'current_occupation' => $data['current_occupation'] ?? null,
        ];

        $this->onboardingRepository->saveFamilyInfo($userId, $familyData);

        // Complete the step
        $this->onboardingRepository->completeOnboardingStep($userId, 'education_work', $data);

        return $this->getProgress($userId);
    }

    /**
     * Save siblings search step
     */
    public function saveSiblingsSearchStep(int $userId, array $data): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Mark that user has searched for siblings
        $familyData = [
            'has_searched_siblings' => $data['searched'] ?? false,
        ];

        $this->onboardingRepository->saveFamilyInfo($userId, $familyData);

        // Complete the step
        $this->onboardingRepository->completeOnboardingStep($userId, 'siblings_search', $data);

        return $this->getProgress($userId);
    }

    /**
     * Complete onboarding
     */
    public function completeOnboarding(int $userId): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Mark the complete step as done
        $this->onboardingRepository->completeOnboardingStep($userId, 'complete');

        // Mark family info as completed
        $this->onboardingRepository->markFamilyInfoComplete($userId);

        // Update user's onboarding_completed flag
        $this->userProfileRepository->updateProfile($userId, ['onboarding_completed' => true]);

        return $this->getProgress($userId);
    }

    /**
     * Get onboarding data for display
     */
    public function getOnboardingData(int $userId): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        $steps = $this->onboardingRepository->getUserOnboardingSteps($userId);
        $familyInfo = $this->onboardingRepository->getFamilyInfo($userId);

        return [
            'user' => [
                'id' => $user->id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'phone' => $user->phone,
                'bio' => $user->bio,
                'date_of_birth' => $user->date_of_birth?->format('Y-m-d'),
                'gender' => $user->gender,
                'address' => $user->address,
            ],
            'steps' => $steps->map(function ($step) {
                return [
                    'name' => $step->step_name,
                    'completed' => $step->is_completed,
                    'data' => $step->step_data,
                ];
            }),
            'family_info' => $familyInfo ? [
                'family_status' => $familyInfo->family_status,
                'number_of_siblings' => $familyInfo->number_of_siblings,
                'number_of_children' => $familyInfo->number_of_children,
                'city' => $familyInfo->city,
                'state_province' => $familyInfo->state_province,
                'country' => $familyInfo->country,
                'education_level' => $familyInfo->education_level,
                'current_occupation' => $familyInfo->current_occupation,
                'has_searched_siblings' => $familyInfo->has_searched_siblings,
            ] : null,
            'progress' => $this->getProgress($userId),
        ];
    }

    /**
     * Save profile image step
     */
    public function saveProfileImageStep(int $userId, ?string $profileImagePath = null): array
    {
        $user = $this->userProfileRepository->getProfile($userId);

        if (!$user) {
            throw ValidationException::withMessages([
                'user' => ['User not found'],
            ]);
        }

        // Update user's profile image if provided
        if ($profileImagePath) {
            $this->userProfileRepository->updateProfile($userId, [
                'profile_image' => $profileImagePath,
            ]);
        }

        // Complete the step
        $stepData = $profileImagePath ? ['profile_image' => $profileImagePath] : [];
        $this->onboardingRepository->completeOnboardingStep($userId, 'profile_image', $stepData);

        return $this->getProgress($userId);
    }
}
