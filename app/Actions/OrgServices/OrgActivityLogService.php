<?php

namespace App\Actions\OrgServices;

use App\Repositories\OrgRepositories\OrgActivityLogRepository;
use App\Repositories\OrgRepositories\OrgAccountRepository;

class OrgActivityLogService
{
    public function __construct(
        private OrgActivityLogRepository $activityLogRepo,
        private OrgAccountRepository $accountRepo,
    ) {}

    public function getActivityLogs(int $organizationId, array $filters): array
    {
        $paginator = $this->activityLogRepo->getPaginatedByOrganization(
            organizationId: $organizationId,
            perPage: 20,
            actionType: $filters['action_type'] ?? null,
            accountId: isset($filters['account_id']) ? (int) $filters['account_id'] : null,
            search: $filters['search'] ?? null,
            dateFrom: $filters['date_from'] ?? null,
            dateTo: $filters['date_to'] ?? null,
        );

        $items = collect($paginator->items())->map(function ($log) {
            return [
                'id' => $log->id,
                'action_type' => $log->action_type,
                'resource_type' => $log->resource_type,
                'description' => $log->description,
                'account_name' => $log->orgAccount
                    ? ($log->orgAccount->display_name ?? $log->orgAccount->username)
                    : 'System',
                'account_id' => $log->org_account_id,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toIso8601String(),
                'created_at_human' => $log->created_at->diffForHumans(),
            ];
        })->toArray();

        return [
            'data' => $items,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }

    public function getFilterOptions(int $organizationId): array
    {
        $actionTypes = $this->activityLogRepo->getDistinctActionTypes($organizationId);

        $accounts = $this->accountRepo->getByOrganization($organizationId)
            ->map(function ($account) {
                return [
                    'id' => $account->id,
                    'name' => $account->display_name ?? $account->username,
                ];
            })->toArray();

        return [
            'action_types' => $actionTypes,
            'accounts' => $accounts,
        ];
    }
}
