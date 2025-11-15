<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = auth()->user();
        $progress = null;

        // Get onboarding progress if user is on onboarding page
        if ($user && $request->path() === 'onboarding' || str_contains($request->path(), 'onboarding')) {
            try {
                $onboardingService = app(\App\Actions\GuestServices\OnboardingService::class);
                $progress = $onboardingService->getProgress($user->id);
            } catch (\Exception $e) {
                // Silently fail if progress can't be retrieved
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'admin' => auth()->guard('admin')->user(),
                'user' => $user ? [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'username' => $user->username,
                    'email' => $user->email,
                    'date_of_birth' => $user->date_of_birth,
                ] : null,
            ],
            'progress' => $progress,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
