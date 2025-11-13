<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\OnboardingStep;
use App\Models\GuestModels\UserFamilyInfo;
use App\Models\GuestModels\User;

class OnboardingRepository
{
    /**
     * Get all onboarding steps for a user
     */
    public function getUserOnboardingSteps(int $userId)
    {
        return OnboardingStep::where('user_id', $userId)
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get a specific onboarding step for a user
     */
    public function getOnboardingStep(int $userId, string $stepName): ?OnboardingStep
    {
        return OnboardingStep::where('user_id', $userId)
            ->where('step_name', $stepName)
            ->first();
    }

    /**
     * Create or update an onboarding step
     */
    public function saveOnboardingStep(int $userId, string $stepName, array $stepData = [], bool $isCompleted = false): OnboardingStep
    {
        return OnboardingStep::updateOrCreate(
            [
                'user_id' => $userId,
                'step_name' => $stepName,
            ],
            [
                'step_data' => $stepData ?: null,
                'is_completed' => $isCompleted,
            ]
        );
    }

    /**
     * Mark an onboarding step as complete
     */
    public function completeOnboardingStep(int $userId, string $stepName, array $stepData = []): OnboardingStep
    {
        return $this->saveOnboardingStep($userId, $stepName, $stepData, true);
    }

    /**
     * Get onboarding progress (percentage of steps completed)
     */
    public function getOnboardingProgress(int $userId): float
    {
        $steps = $this->getUserOnboardingSteps($userId);

        if ($steps->isEmpty()) {
            return 0;
        }

        $completedCount = $steps->where('is_completed', true)->count();
        $totalCount = $steps->count();

        return ($completedCount / $totalCount) * 100;
    }

    /**
     * Check if user has completed onboarding
     */
    public function isOnboardingComplete(int $userId): bool
    {
        $steps = $this->getUserOnboardingSteps($userId);

        if ($steps->isEmpty()) {
            return false;
        }

        return $steps->every(function ($step) {
            return $step->is_completed;
        });
    }

    /**
     * Initialize onboarding steps for a new user
     */
    public function initializeOnboarding(int $userId): void
    {
        $stepNames = [
            'basic_info',
            'family_status',
            'location_info',
            'education_work',
            'siblings_search',
            'complete',
        ];

        foreach ($stepNames as $stepName) {
            OnboardingStep::updateOrCreate(
                [
                    'user_id' => $userId,
                    'step_name' => $stepName,
                ],
                [
                    'is_completed' => false,
                    'step_data' => null,
                ]
            );
        }
    }

    /**
     * Get or create user family info
     */
    public function getFamilyInfo(int $userId): ?UserFamilyInfo
    {
        return UserFamilyInfo::where('user_id', $userId)->first();
    }

    /**
     * Save family info for user
     */
    public function saveFamilyInfo(int $userId, array $data): UserFamilyInfo
    {
        return UserFamilyInfo::updateOrCreate(
            ['user_id' => $userId],
            $data
        );
    }

    /**
     * Mark family info as completed
     */
    public function markFamilyInfoComplete(int $userId): UserFamilyInfo
    {
        return $this->saveFamilyInfo($userId, ['completed_at' => now()]);
    }
}
