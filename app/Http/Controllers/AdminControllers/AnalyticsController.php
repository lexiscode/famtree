<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {
    }

    /**
     * Display analytics overview
     */
    public function overview()
    {
        $data = $this->analyticsService->getOverview();

        return Inertia::render('AdminPages/Analytics/Overview', [
            'metrics' => $data,
        ]);
    }

    /**
     * Display user analytics
     */
    public function users()
    {
        $data = $this->analyticsService->getUserAnalytics();

        return Inertia::render('AdminPages/Analytics/Users', [
            'analytics' => $data,
        ]);
    }

    /**
     * Display content analytics
     */
    public function content()
    {
        $data = $this->analyticsService->getContentAnalytics();

        return Inertia::render('AdminPages/Analytics/Content', [
            'analytics' => $data,
        ]);
    }

    /**
     * Display connection analytics
     */
    public function connections()
    {
        $data = $this->analyticsService->getConnectionAnalytics();

        return Inertia::render('AdminPages/Analytics/Connections', [
            'analytics' => $data,
        ]);
    }

    /**
     * Display organization analytics
     */
    public function organizations()
    {
        $data = $this->analyticsService->getOrgAnalytics();

        return Inertia::render('AdminPages/Analytics/Organizations', [
            'analytics' => $data,
        ]);
    }
}
