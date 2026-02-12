<?php

namespace App\Http\Controllers\OrgControllers\Traits;

use Illuminate\Support\Facades\Gate;

trait AuthorizesOrgActions
{
    protected function authorizeOrg(string $ability): void
    {
        Gate::authorize($ability);
    }
}
