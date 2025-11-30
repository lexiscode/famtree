<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use App\Models\AdminActivityLog;

class AdminGuardMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = Auth::guard('admin')->user();

        // Check if admin is authenticated
        if (!$admin) {
            return redirect('/admin/login')->with('error', 'You must be logged in to access the admin panel.');
        }

        // Check if admin is active
        if (!$admin->is_active) {
            Auth::guard('admin')->logout();
            return redirect('/admin/login')->with('error', 'Your admin account has been deactivated.');
        }

        // Log the admin activity
        AdminActivityLog::create([
            'admin_id' => $admin->id,
            'action_type' => 'page_access',
            'resource_type' => 'page',
            'description' => 'Accessed: ' . $request->getPathInfo(),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return $next($request);
    }
}
