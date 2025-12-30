<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use Inertia\Inertia;
use App\Http\Controllers\Controller;
use App\Actions\GuestServices\UserFollowService;
use App\Models\GuestModels\User;

class UserFollowController extends Controller
{
    public function __construct(
        private UserFollowService $followService,
    ) {}

    /**
     * Follow a user
     */
    public function follow(int $userId)
    {
        try {
            $user = auth()->user();
            $this->followService->followUser($user, $userId);

            return back()->with('success', 'Successfully followed user!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Unfollow a user
     */
    public function unfollow(int $userId)
    {
        try {
            $user = auth()->user();
            $this->followService->unfollowUser($user, $userId);

            return back()->with('success', 'Successfully unfollowed user!');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * View followers list for a user
     */
    public function followers(int $userId)
    {
        $viewer = auth()->user();
        $targetUser = User::findOrFail($userId);

        // Get followers list
        $followers = $this->followService->getFollowersList($userId, $viewer->id);

        // Get follow status for the target user
        $followStatus = $this->followService->getFollowStatus($viewer->id, $userId);

        return Inertia::render('GuestPages/AuthAccessPages/Follow/FollowersList', [
            'user' => [
                'id' => $targetUser->id,
                'first_name' => $targetUser->first_name,
                'last_name' => $targetUser->last_name,
                'name' => trim($targetUser->first_name . ' ' . $targetUser->last_name),
                'username' => $targetUser->username,
                'profile_image_url' => $targetUser->profile_image_url,
            ],
            'followers' => $followers,
            'followerCount' => $followStatus['follower_count'],
            'followingCount' => $followStatus['following_count'],
            'isOwnProfile' => $viewer->id === $userId,
        ]);
    }

    /**
     * View following list for a user
     */
    public function following(int $userId)
    {
        $viewer = auth()->user();
        $targetUser = User::findOrFail($userId);

        // Get following list
        $following = $this->followService->getFollowingList($userId, $viewer->id);

        // Get follow status for the target user
        $followStatus = $this->followService->getFollowStatus($viewer->id, $userId);

        return Inertia::render('GuestPages/AuthAccessPages/Follow/FollowingList', [
            'user' => [
                'id' => $targetUser->id,
                'first_name' => $targetUser->first_name,
                'last_name' => $targetUser->last_name,
                'name' => trim($targetUser->first_name . ' ' . $targetUser->last_name),
                'username' => $targetUser->username,
                'profile_image_url' => $targetUser->profile_image_url,
            ],
            'following' => $following,
            'followerCount' => $followStatus['follower_count'],
            'followingCount' => $followStatus['following_count'],
            'isOwnProfile' => $viewer->id === $userId,
        ]);
    }
}
