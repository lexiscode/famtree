<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\OrgModels\OrgActivityLog;

class OrgAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('org')->check()) {
            return redirect()->route('org.login')->with('error', 'Please login to your organization account first.');
        }

        $orgAccount = Auth::guard('org')->user();

        if (!$orgAccount->is_active) {
            Auth::guard('org')->logout();
            $request->session()->invalidate();
            return redirect()->route('org.login')->with('error', 'Your organization account has been deactivated. Contact your administrator.');
        }

        try {
            OrgActivityLog::create([
                'org_account_id' => $orgAccount->id,
                'organization_id' => $orgAccount->organization_id,
                'action_type' => 'page_access',
                'resource_type' => 'org_page',
                'description' => 'Accessed: ' . $request->getPathInfo(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Log silently to not break the request
        }

        return $next($request);
    }
}
