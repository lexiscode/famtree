<?php

namespace App\Providers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Policies\OrgPermissionPolicy;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerOrgGates();
    }

    private function registerOrgGates(): void
    {
        $gates = [
            'manage-posts' => 'managePosts',
            'manage-broadcasts' => 'manageBroadcasts',
            'manage-staff' => 'manageStaff',
            'view-analytics' => 'viewAnalytics',
            'manage-groups' => 'manageGroups',
            'manage-profile' => 'manageProfile',
        ];

        foreach ($gates as $gate => $method) {
            Gate::define($gate, function (?object $user = null) use ($method) {
                $orgAccount = Auth::guard('org')->user();
                if (!$orgAccount) {
                    return false;
                }
                return app(OrgPermissionPolicy::class)->{$method}($orgAccount);
            });
        }
    }
}
