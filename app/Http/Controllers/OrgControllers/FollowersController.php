<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgFollowerService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class FollowersController extends Controller
{
    public function __construct(
        private OrgFollowerService $followerService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();

        $followers = $this->followerService->getFollowers($orgAccount->organization_id);

        $formattedFollowers = $followers->through(function ($follow) {
            return [
                'id' => $follow->id,
                'user' => $follow->user ? [
                    'id' => $follow->user->id,
                    'first_name' => $follow->user->first_name,
                    'last_name' => $follow->user->last_name,
                    'username' => $follow->user->username,
                    'profile_image_url' => $follow->user->profile_image_url,
                ] : null,
                'followed_at' => $follow->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('OrgPages/Followers/Index', [
            'followers' => $formattedFollowers,
        ]);
    }
}
