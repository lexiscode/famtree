<?php

namespace App\Http\Controllers\OrgControllers;

use App\Http\Controllers\Controller;
use App\Actions\OrgServices\OrgAnalyticsService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private OrgAnalyticsService $analyticsService,
    ) {}

    public function index()
    {
        $orgAccount = Auth::guard('org')->user();
        $organizationId = $orgAccount->organization_id;

        return Inertia::render('OrgPages/Analytics/Index', [
            'followerGrowth' => $this->analyticsService->getFollowerGrowth($organizationId),
            'postEngagement' => $this->analyticsService->getPostEngagement($organizationId),
            'broadcastReach' => $this->analyticsService->getBroadcastReach($organizationId),
        ]);
    }
}
