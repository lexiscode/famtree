<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Actions\GuestServices\DeceasedVerificationService;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeceasedVerificationController extends Controller
{
    public function __construct(
        protected DeceasedVerificationService $verificationService
    ) {}

    /**
     * Show the family status check form.
     */
    public function showFamilyCheckForm(string $verificationUuid)
    {
        $verification = $this->verificationService->findByUuid($verificationUuid);

        if (!$verification) {
            return redirect('/')->with('error', 'Status check not found.');
        }

        if ($verification->stage !== 'family_check') {
            return redirect('/')->with('error', 'This status check is no longer active.');
        }

        $inactiveUser = $verification->user;

        // Check if the current user can respond
        $currentUser = auth()->user();
        if ($currentUser && !$this->verificationService->canUserRespond($verification, $currentUser)) {
            return redirect('/')->with('error', 'You are not authorized to respond to this status check.');
        }

        // Check if user has already responded
        if ($currentUser) {
            $hasResponded = $verification->responses()
                ->where('responder_id', $currentUser->id)
                ->exists();

            if ($hasResponded) {
                return Inertia::render('GuestPages/StatusCheck/AlreadyResponded', [
                    'inactiveUser' => [
                        'first_name' => $inactiveUser->first_name,
                        'last_name' => $inactiveUser->last_name,
                    ],
                ]);
            }
        }

        return Inertia::render('GuestPages/StatusCheck/Index', [
            'verification' => [
                'uuid' => $verification->uuid,
            ],
            'inactiveUser' => [
                'first_name' => $inactiveUser->first_name,
                'last_name' => $inactiveUser->last_name,
                'profile_image_url' => $inactiveUser->profile_image_url,
            ],
        ]);
    }

    /**
     * Submit the family member's response.
     */
    public function submitFamilyResponse(Request $request, string $verificationUuid)
    {
        $request->validate([
            'response' => 'required|in:alive,deceased,unknown',
        ]);

        $verification = $this->verificationService->findByUuid($verificationUuid);

        if (!$verification) {
            return back()->with('error', 'Status check not found.');
        }

        if ($verification->stage !== 'family_check') {
            return back()->with('error', 'This status check is no longer active.');
        }

        $currentUser = auth()->user();

        if (!$this->verificationService->canUserRespond($verification, $currentUser)) {
            return back()->with('error', 'You are not authorized to respond to this status check.');
        }

        // Get the relationship type
        $relationshipType = $this->verificationService->getResponderRelationship(
            $verification->user_id,
            $currentUser->id
        );

        try {
            $this->verificationService->recordResponse(
                $verification,
                $currentUser,
                $relationshipType ?? 'family',
                $request->input('response')
            );

            return Inertia::render('GuestPages/StatusCheck/ThankYou', [
                'inactiveUser' => [
                    'first_name' => $verification->user->first_name,
                    'last_name' => $verification->user->last_name,
                ],
            ]);
        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Cancel the pending status change (called by the inactive user).
     */
    public function cancelPendingChange()
    {
        $user = auth()->user();
        $verification = $user->getPendingVerification();

        if (!$verification) {
            return back()->with('error', 'No pending status change found.');
        }

        if (!$verification->canBeCancelled()) {
            return back()->with('error', 'This status change cannot be cancelled.');
        }

        $this->verificationService->cancelVerification($verification, 'Cancelled by user');

        return redirect()->route('profile')->with('success', 'Your status change has been cancelled.');
    }
}
