<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\OrganizationRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class OrganizationService
{
    public function __construct(private OrganizationRepository $repository)
    {
    }

    public function getAllOrgs(int $perPage = 15, int $page = 1)
    {
        return $this->repository->getAllPaginated($perPage, $page)->through(function ($org) {
            return $this->formatOrgForList($org);
        });
    }

    public function searchOrgs(string $query, int $perPage = 15, int $page = 1)
    {
        return $this->repository->search($query, $perPage, $page)->through(function ($org) {
            return $this->formatOrgForList($org);
        });
    }

    public function getFilteredOrgs(array $filters, int $perPage = 15, int $page = 1)
    {
        return $this->repository->filterByCriteria($filters, $perPage, $page)->through(function ($org) {
            return $this->formatOrgForList($org);
        });
    }

    public function getOrgDetails(int $id): ?array
    {
        $org = $this->repository->find($id);

        if (!$org) {
            return null;
        }

        return [
            'id' => $org->id,
            'uuid' => $org->uuid,
            'name' => $org->name,
            'slug' => $org->slug,
            'short_name' => $org->short_name,
            'description' => $org->description,
            'vision' => $org->vision,
            'mission' => $org->mission,
            'logo_url' => $org->logo_url,
            'cover_image_url' => $org->cover_image_url,
            'address' => $org->address,
            'city' => $org->city,
            'state' => $org->state,
            'country' => $org->country,
            'website' => $org->website,
            'email' => $org->email,
            'phone' => $org->phone,
            'founded_year' => $org->founded_year,
            'leader_name' => $org->leader_name,
            'leader_title' => $org->leader_title,
            'leader_qualifications' => $org->leader_qualifications,
            'leader_image_url' => $org->leader_image_url,
            'is_active' => $org->is_active,
            'category' => $org->category ? [
                'id' => $org->category->id,
                'name' => $org->category->name,
                'slug' => $org->category->slug,
            ] : null,
            'org_accounts_count' => $org->org_accounts_count,
            'followers_count' => $org->followers_count,
            'org_posts_count' => $org->org_posts_count,
            'faculties_count' => $org->faculties_count,
            'faculties' => $org->faculties->map(function ($faculty) {
                return [
                    'id' => $faculty->id,
                    'name' => $faculty->name,
                    'is_active' => $faculty->is_active,
                    'departments' => $faculty->departments->map(function ($dept) {
                        return [
                            'id' => $dept->id,
                            'name' => $dept->name,
                            'is_active' => $dept->is_active,
                            'class_sets_count' => $dept->classSets->count(),
                        ];
                    }),
                ];
            }),
            'staff' => $org->orgAccounts->map(function ($account) {
                return [
                    'id' => $account->id,
                    'username' => $account->username,
                    'email' => $account->email,
                    'display_name' => $account->display_name,
                    'is_active' => $account->is_active,
                    'role_name' => $account->orgRole?->name ?? 'No Role',
                    'last_login_at' => $account->last_login_at?->format('Y-m-d H:i:s'),
                    'created_at' => $account->created_at->format('Y-m-d H:i:s'),
                ];
            }),
            'created_at' => $org->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $org->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    public function createOrg(array $data): ?\App\Models\GuestModels\Organization
    {
        try {
            $data['uuid'] = Str::uuid()->toString();
            $data['slug'] = Str::slug($data['name']);
            $org = $this->repository->create($data);
            $this->logActivity('create_organization', 'Organization', $org->id, "Created organization: {$org->name}");
            return $org;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function updateOrg(int $id, array $data): bool
    {
        try {
            if (isset($data['name'])) {
                $data['slug'] = Str::slug($data['name']);
            }
            $org = $this->repository->update($id, $data);
            if ($org) {
                $this->logActivity('update_organization', 'Organization', $id, "Updated organization: {$org->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function suspendOrg(int $id): bool
    {
        try {
            $org = $this->repository->update($id, ['is_active' => false]);
            if ($org) {
                $this->logActivity('suspend_organization', 'Organization', $id, "Suspended organization: {$org->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function unsuspendOrg(int $id): bool
    {
        try {
            $org = $this->repository->update($id, ['is_active' => true]);
            if ($org) {
                $this->logActivity('unsuspend_organization', 'Organization', $id, "Unsuspended organization: {$org->name}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function deleteOrg(int $id): bool
    {
        try {
            $org = $this->repository->find($id);
            if ($org) {
                $this->logActivity('delete_organization', 'Organization', $id, "Deleted organization: {$org->name}");
                return $this->repository->delete($id);
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function getOrgStats(): array
    {
        return [
            'total' => $this->repository->count(),
            'active' => $this->repository->countActive(),
            'inactive' => $this->repository->countInactive(),
        ];
    }

    public function getStaff(int $orgId): array
    {
        $staff = $this->repository->getStaff($orgId);
        return $staff->map(function ($account) {
            return [
                'id' => $account->id,
                'username' => $account->username,
                'email' => $account->email,
                'display_name' => $account->display_name,
                'is_active' => $account->is_active,
                'role_name' => $account->orgRole?->name ?? 'No Role',
                'last_login_at' => $account->last_login_at?->format('Y-m-d H:i:s'),
                'created_at' => $account->created_at->format('Y-m-d H:i:s'),
            ];
        })->toArray();
    }

    public function createStaffAccount(int $orgId, array $data): bool
    {
        try {
            $data['organization_id'] = $orgId;
            $data['uuid'] = Str::uuid()->toString();
            $data['password'] = bcrypt($data['password']);
            $account = $this->repository->createStaff($data);
            $this->logActivity('create_staff', 'OrgAccount', $account->id, "Created staff account: {$account->username} for org #{$orgId}");
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function disableStaffAccount(int $staffId): bool
    {
        try {
            $staff = $this->repository->findStaff($staffId);
            if ($staff) {
                $staff->update(['is_active' => false]);
                $this->logActivity('disable_staff', 'OrgAccount', $staffId, "Disabled staff account: {$staff->username}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    public function resetStaffPassword(int $staffId): bool
    {
        try {
            $staff = $this->repository->findStaff($staffId);
            if ($staff) {
                $newPassword = Str::random(12);
                $staff->update(['password' => bcrypt($newPassword)]);
                $this->logActivity('reset_staff_password', 'OrgAccount', $staffId, "Reset password for staff: {$staff->username}");
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    private function formatOrgForList($org): array
    {
        return [
            'id' => $org->id,
            'uuid' => $org->uuid,
            'name' => $org->name,
            'short_name' => $org->short_name,
            'slug' => $org->slug,
            'logo_url' => $org->logo_url,
            'city' => $org->city,
            'state' => $org->state,
            'country' => $org->country,
            'is_active' => $org->is_active,
            'category_name' => $org->category?->name ?? 'Uncategorized',
            'org_accounts_count' => $org->org_accounts_count,
            'followers_count' => $org->followers_count,
            'org_posts_count' => $org->org_posts_count,
            'faculties_count' => $org->faculties_count,
            'created_at' => $org->created_at->format('Y-m-d'),
            'created_at_formatted' => $org->created_at->diffForHumans(),
        ];
    }

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
            // Silently fail
        }
    }
}
