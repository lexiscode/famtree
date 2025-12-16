<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Models\GuestModels\User;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\ProfilePrivacyService;
use App\Actions\GuestServices\NotificationService;
use App\Actions\GuestServices\AuthAccessServices\SuggestedConnectionService;
use App\Actions\GuestServices\AuthAccessServices\ProfileCompletionService;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class LandingPageController extends Controller
{
    public function __construct(
        private UserConnectionRepository $connectionRepository,
        private NotificationService $notificationService,
        private SuggestedConnectionService $suggestedConnectionService,
        private ProfileCompletionService $profileCompletionService,
    ) {}

    /**
     * Display the home page for authenticated users
     * Redirects to onboarding if user hasn't completed it yet
     * Otherwise shows the user's profile page
     */
    public function index()
    {
        $user = auth()->user()->load('familyInfo');

        if (!$user) {
            return redirect()->route('home');
        }

        // Show their profile
        // Get all user connections
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);

        // Get pending requests
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);

        // Format user data
        $userData = [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'name' => $user->first_name . ' ' . $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'gender' => $user->gender ?? null,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status ?? 'Alive',
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'created_at' => $user->created_at,
        ];

        // Get unread notification count
        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);

        // Get suggested connections count
        $suggestedConnectionsCount = $this->suggestedConnectionService->getSuggestedMembersCount($user->id);

        // Get profile completion data
        $profileCompletion = $this->profileCompletionService->getProfileCompletion($user);

        return Inertia::render('GuestPages/AuthAccessPages/Profile/MyProfile', [
            'user' => $userData,
            'connections' => $connections,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
            'suggestedConnectionsCount' => $suggestedConnectionsCount,
            'profileCompletion' => $profileCompletion,
        ]);
    }
}
