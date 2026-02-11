<?php

namespace App\Actions\OrgServices;

use App\Models\OrgModels\OrganizationFollow;
use App\Models\OrgModels\OrgPost;
use App\Models\OrgModels\OrgBroadcast;
use Illuminate\Support\Facades\DB;

class OrgAnalyticsService
{
    public function getFollowerGrowth(int $organizationId, int $days = 30): array
    {
        $data = OrganizationFollow::where('organization_id', $organizationId)
            ->where('created_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $data->map(fn ($item) => [
            'date' => $item->date,
            'count' => $item->count,
        ])->toArray();
    }

    public function getPostEngagement(int $organizationId, int $days = 30): array
    {
        $posts = OrgPost::where('organization_id', $organizationId)
            ->where('created_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(views_count) as views'),
                DB::raw('SUM(reactions_count) as reactions'),
                DB::raw('SUM(comments_count) as comments'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $posts->map(fn ($item) => [
            'date' => $item->date,
            'views' => (int) $item->views,
            'reactions' => (int) $item->reactions,
            'comments' => (int) $item->comments,
        ])->toArray();
    }

    public function getBroadcastReach(int $organizationId, int $days = 30): array
    {
        $broadcasts = OrgBroadcast::where('organization_id', $organizationId)
            ->where('status', 'sent')
            ->where('sent_at', '>=', now()->subDays($days))
            ->select(DB::raw('DATE(sent_at) as date'), DB::raw('SUM(sent_to_count) as reach'))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $broadcasts->map(fn ($item) => [
            'date' => $item->date,
            'reach' => (int) $item->reach,
        ])->toArray();
    }
}
