<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\ConnectionFeedsService;
use App\Actions\GuestServices\NotificationService;
use App\Repositories\GuestRepositories\UserConnectionRepository;

class ConnectionFeedsController extends Controller
{
    public function __construct(
        private ConnectionFeedsService $feedService,
        private UserConnectionRepository $connectionRepository,
        private NotificationService $notificationService,
    ) {}

    /**
     * Display connection feeds page
     * Shows posts from direct and indirect connections (last 30 days)
     * Respects privacy settings for each post
     */
    public function index()
    {
        $user = auth()->user()->load('familyInfo');

        if (!$user) {
            return redirect()->route('home');
        }

        // Get connection feeds with privacy filtering
        $posts = $this->feedService->getConnectionFeeds($user);

        // Get user's connections and pending requests for sidebar
        $connections = $this->connectionRepository->getConnections($user->id);
        $connectionCount = count($connections);
        $pendingRequests = $this->connectionRepository->getPendingRequests($user->id);
        $sentRequests = $this->connectionRepository->getSentRequests($user->id);
        $unreadNotificationCount = $this->notificationService->getUnreadCount($user->id);

        // Format user data for sidebar
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'username' => $user->username,
            'email' => $user->email,
            'phone' => $user->phone,
            'address' => $user->address,
            'bio' => $user->bio,
            'date_of_birth' => $user->date_of_birth,
            'profile_image_url' => $user->profile_image_url,
            'status' => $user->status,
            'job_title' => $user->familyInfo?->current_occupation ?? null,
            'education' => $user->familyInfo?->education_level ?? null,
            'created_at' => $user->created_at,
        ];

        // Get stats
        $stats = $this->feedService->getConnectionFeedsStats($user);

        // Get top trending posts for right sidebar
        $topTrendingPosts = $this->feedService->getTopTrendingPosts($user, 5);

        return Inertia::render('GuestPages/AuthAccessPages/ConnectionFeeds/Index', [
            'user' => $userData,
            'posts' => $posts,
            'postCount' => count($posts),
            'stats' => $stats,
            'topTrendingPosts' => $topTrendingPosts,
            'connectionCount' => $connectionCount,
            'pendingRequestCount' => count($pendingRequests),
            'sentRequestCount' => count($sentRequests),
            'unreadNotificationCount' => $unreadNotificationCount,
        ]);
    }
}
