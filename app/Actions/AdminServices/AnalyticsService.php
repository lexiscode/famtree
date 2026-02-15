<?php

namespace App\Actions\AdminServices;

use App\Models\GuestModels\User;
use App\Models\GuestModels\Post;
use App\Models\GuestModels\UserConnection;
use App\Models\GuestModels\Organization;
use App\Models\GuestModels\Gallery;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get overview with key metrics
     */
    public function getOverview(): array
    {
        $now = now();
        $lastMonth = $now->copy()->subMonth();

        $totalUsers = User::count();
        $totalUsersLastMonth = User::where('created_at', '<', $lastMonth)->count();
        $userGrowth = $totalUsersLastMonth > 0
            ? round((($totalUsers - $totalUsersLastMonth) / $totalUsersLastMonth) * 100, 1)
            : 0;

        $totalPosts = Post::count();
        $totalPostsLastMonth = Post::where('created_at', '<', $lastMonth)->count();
        $postGrowth = $totalPostsLastMonth > 0
            ? round((($totalPosts - $totalPostsLastMonth) / $totalPostsLastMonth) * 100, 1)
            : 0;

        $totalConnections = UserConnection::where('status', 'accepted')->count();
        $totalConnectionsLastMonth = UserConnection::where('status', 'accepted')
            ->where('created_at', '<', $lastMonth)->count();
        $connectionGrowth = $totalConnectionsLastMonth > 0
            ? round((($totalConnections - $totalConnectionsLastMonth) / $totalConnectionsLastMonth) * 100, 1)
            : 0;

        $totalOrgs = Organization::count();
        $totalOrgsLastMonth = Organization::where('created_at', '<', $lastMonth)->count();
        $orgGrowth = $totalOrgsLastMonth > 0
            ? round((($totalOrgs - $totalOrgsLastMonth) / $totalOrgsLastMonth) * 100, 1)
            : 0;

        return [
            'totalUsers' => $totalUsers,
            'userGrowth' => $userGrowth,
            'totalPosts' => $totalPosts,
            'postGrowth' => $postGrowth,
            'totalConnections' => $totalConnections,
            'connectionGrowth' => $connectionGrowth,
            'totalOrganizations' => $totalOrgs,
            'orgGrowth' => $orgGrowth,
            'activeUsersToday' => User::where('updated_at', '>=', $now->copy()->startOfDay())->count(),
            'newUsersThisWeek' => User::where('created_at', '>=', $now->copy()->startOfWeek())->count(),
            'newPostsThisWeek' => Post::where('created_at', '>=', $now->copy()->startOfWeek())->count(),
        ];
    }

    /**
     * Get user analytics data
     */
    public function getUserAnalytics(): array
    {
        // User growth by month (last 12 months)
        $growthByMonth = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $growthByMonth[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Retention: users active in last 7/30/90 days
        $retention = [
            'active_7_days' => User::where('updated_at', '>=', now()->subDays(7))->count(),
            'active_30_days' => User::where('updated_at', '>=', now()->subDays(30))->count(),
            'active_90_days' => User::where('updated_at', '>=', now()->subDays(90))->count(),
            'total' => User::count(),
        ];

        // 2FA adoption
        $twoFaEnabled = User::where('two_fa_enabled', true)->count();
        $twoFaTotal = User::count();

        // Child accounts
        $childAccounts = User::where('is_child_account', true)->count();

        // Account status distribution
        $statusDistribution = User::select('account_status', DB::raw('count(*) as count'))
            ->groupBy('account_status')
            ->pluck('count', 'account_status')
            ->toArray();

        // Gender distribution
        $genderDistribution = User::select('gender', DB::raw('count(*) as count'))
            ->whereNotNull('gender')
            ->groupBy('gender')
            ->pluck('count', 'gender')
            ->toArray();

        return [
            'growthByMonth' => $growthByMonth,
            'retention' => $retention,
            'twoFaAdoption' => [
                'enabled' => $twoFaEnabled,
                'total' => $twoFaTotal,
                'percentage' => $twoFaTotal > 0 ? round(($twoFaEnabled / $twoFaTotal) * 100, 1) : 0,
            ],
            'childAccounts' => $childAccounts,
            'statusDistribution' => $statusDistribution,
            'genderDistribution' => $genderDistribution,
        ];
    }

    /**
     * Get content analytics data
     */
    public function getContentAnalytics(): array
    {
        // Posts by type
        $postsByType = Post::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->pluck('count', 'type')
            ->toArray();

        // Posts by privacy
        $postsByPrivacy = Post::select('privacy', DB::raw('count(*) as count'))
            ->groupBy('privacy')
            ->pluck('count', 'privacy')
            ->toArray();

        // Engagement rates
        $totalPosts = Post::count();
        $totalReactions = Post::sum('reactions_count');
        $totalComments = Post::sum('comments_count');
        $totalViews = Post::sum('views_count');

        $avgReactionsPerPost = $totalPosts > 0 ? round($totalReactions / $totalPosts, 2) : 0;
        $avgCommentsPerPost = $totalPosts > 0 ? round($totalComments / $totalPosts, 2) : 0;
        $avgViewsPerPost = $totalPosts > 0 ? round($totalViews / $totalPosts, 2) : 0;

        // Top posts by engagement
        $topPosts = Post::with('user')
            ->orderByRaw('(reactions_count + comments_count + views_count) DESC')
            ->limit(10)
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'content' => \Illuminate\Support\Str::limit($post->content, 100),
                    'type' => $post->type,
                    'author' => $post->user ? "{$post->user->first_name} {$post->user->last_name}" : 'Deleted User',
                    'reactions_count' => $post->reactions_count,
                    'comments_count' => $post->comments_count,
                    'views_count' => $post->views_count,
                    'created_at' => $post->created_at->format('Y-m-d'),
                ];
            });

        // Posts per month (last 12 months)
        $postsByMonth = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = Post::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $postsByMonth[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Gallery stats
        $totalGalleries = Gallery::count();

        return [
            'postsByType' => $postsByType,
            'postsByPrivacy' => $postsByPrivacy,
            'engagement' => [
                'avgReactionsPerPost' => $avgReactionsPerPost,
                'avgCommentsPerPost' => $avgCommentsPerPost,
                'avgViewsPerPost' => $avgViewsPerPost,
                'totalReactions' => (int) $totalReactions,
                'totalComments' => (int) $totalComments,
                'totalViews' => (int) $totalViews,
            ],
            'topPosts' => $topPosts,
            'postsByMonth' => $postsByMonth,
            'totalGalleries' => $totalGalleries,
        ];
    }

    /**
     * Get connection analytics data
     */
    public function getConnectionAnalytics(): array
    {
        // Relationship type distribution
        $typeDistribution = UserConnection::where('status', 'accepted')
            ->select('relationship_type', DB::raw('count(*) as count'))
            ->groupBy('relationship_type')
            ->orderByDesc('count')
            ->pluck('count', 'relationship_type')
            ->toArray();

        // Status distribution
        $statusDistribution = UserConnection::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // Connections per month (last 12 months)
        $connectionsByMonth = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = UserConnection::where('status', 'accepted')
                ->whereYear('accepted_at', $date->year)
                ->whereMonth('accepted_at', $date->month)
                ->count();
            $connectionsByMonth[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Divorced connections
        $divorcedCount = UserConnection::whereNotNull('divorced_at')->count();

        // Average connections per user
        $totalUsers = User::count();
        $totalConnections = UserConnection::where('status', 'accepted')->count();
        $avgConnectionsPerUser = $totalUsers > 0 ? round($totalConnections / $totalUsers, 2) : 0;

        return [
            'typeDistribution' => $typeDistribution,
            'statusDistribution' => $statusDistribution,
            'connectionsByMonth' => $connectionsByMonth,
            'divorcedCount' => $divorcedCount,
            'avgConnectionsPerUser' => $avgConnectionsPerUser,
            'totalAccepted' => $statusDistribution['accepted'] ?? 0,
            'totalPending' => $statusDistribution['pending'] ?? 0,
        ];
    }

    /**
     * Get organization analytics data
     */
    public function getOrgAnalytics(): array
    {
        // Org growth by month (last 12 months)
        $growthByMonth = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = Organization::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $growthByMonth[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Top orgs by followers
        $topOrgsByFollowers = Organization::withCount('followers')
            ->orderByDesc('followers_count')
            ->limit(10)
            ->get()
            ->map(function ($org) {
                return [
                    'id' => $org->id,
                    'name' => $org->name,
                    'short_name' => $org->short_name,
                    'followers_count' => $org->followers_count,
                    'is_active' => $org->is_active,
                ];
            });

        // Active vs inactive
        $activeOrgs = Organization::where('is_active', true)->count();
        $inactiveOrgs = Organization::where('is_active', false)->count();

        // Orgs by category
        $orgsByCategory = Organization::join('organization_categories', 'organizations.category_id', '=', 'organization_categories.id')
            ->select('organization_categories.name', DB::raw('count(*) as count'))
            ->groupBy('organization_categories.name')
            ->pluck('count', 'name')
            ->toArray();

        return [
            'growthByMonth' => $growthByMonth,
            'topOrgsByFollowers' => $topOrgsByFollowers,
            'activeOrgs' => $activeOrgs,
            'inactiveOrgs' => $inactiveOrgs,
            'orgsByCategory' => $orgsByCategory,
            'totalOrgs' => $activeOrgs + $inactiveOrgs,
        ];
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
        }
    }
}
