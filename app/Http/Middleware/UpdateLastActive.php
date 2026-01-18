<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\GuestModels\DeceasedVerification;

class UpdateLastActive
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $user = auth()->user();

            // Update last active timestamp
            // Only update if more than 5 minutes since last update to reduce DB writes
            if (!$user->last_active_at || $user->last_active_at->diffInMinutes(now()) >= 5) {
                $user->update([
                    'last_active_at' => now(),
                ]);

                // Cancel any pending deceased verification if user is active
                $this->cancelPendingVerificationIfExists($user);
            }
        }

        return $next($request);
    }

    /**
     * Cancel pending deceased verification if the user logs in or becomes active.
     */
    protected function cancelPendingVerificationIfExists($user): void
    {
        $pendingVerification = DeceasedVerification::forUser($user->id)
            ->pending()
            ->first();

        if ($pendingVerification) {
            $pendingVerification->update([
                'stage' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_reason' => 'User activity detected',
                'final_status' => 'alive',
            ]);
        }
    }
}
