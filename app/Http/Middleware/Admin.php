<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminActivityLog;

class Admin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if admin is authenticated
        if (!Auth::guard('admin')->check()) {
            return redirect()->route('admin.login')->with('error', 'Please login as an admin first.');
        }

        $admin = Auth::guard('admin')->user();

        // Check if admin account is active
        if (!$admin->is_active) {
            Auth::guard('admin')->logout();
            $request->session()->invalidate();
            return redirect()->route('admin.login')->with('error', 'Your admin account has been deactivated. Contact your administrator.');
        }

        // Log admin activity (page access)
        try {
            AdminActivityLog::create([
                'admin_id' => $admin->id,
                'action_type' => 'page_access',
                'resource_type' => 'admin_page',
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
