<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Repositories\AdminRepositories\TeamRepository;
use App\Models\AdminActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function __construct(private TeamRepository $teamRepo)
    {
    }

    public function index()
    {
        $admins = $this->teamRepo->getAll()->map(function ($admin) {
            return [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'role' => $admin->role,
                'is_active' => $admin->is_active,
                'last_login_at' => $admin->last_login_at?->format('Y-m-d H:i:s'),
                'last_login_at_formatted' => $admin->last_login_at?->diffForHumans() ?? 'Never',
                'created_at' => $admin->created_at->format('Y-m-d'),
                'created_at_formatted' => $admin->created_at->diffForHumans(),
            ];
        });

        $statistics = [
            'total' => $this->teamRepo->count(),
            'active' => $this->teamRepo->countActive(),
        ];

        return Inertia::render('AdminPages/Team/Index', [
            'admins' => $admins,
            'statistics' => $statistics,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255|unique:admins,username',
            'email' => 'required|email|max:255|unique:admins,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:50',
        ]);

        $data['password'] = bcrypt($data['password']);

        $admin = $this->teamRepo->create($data);

        if ($admin) {
            $this->logActivity('create_admin', 'Admin', $admin->id, "Created admin account: {$admin->username}");
            return redirect()->back()->with('success', 'Admin account created successfully');
        }

        return redirect()->back()->with('error', 'Failed to create admin account');
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|string|max:50',
        ]);

        $admin = $this->teamRepo->update($id, $data);

        if ($admin) {
            $this->logActivity('update_admin', 'Admin', $id, "Updated admin account: {$admin->username}");
            return redirect()->back()->with('success', 'Admin account updated');
        }

        return redirect()->back()->with('error', 'Failed to update admin account');
    }

    public function disable(int $id)
    {
        $admin = $this->teamRepo->find($id);

        if (!$admin) {
            return redirect()->back()->with('error', 'Admin not found');
        }

        $newStatus = !$admin->is_active;
        $this->teamRepo->update($id, ['is_active' => $newStatus]);
        $action = $newStatus ? 'enabled' : 'disabled';
        $this->logActivity("{$action}_admin", 'Admin', $id, ucfirst($action) . " admin account: {$admin->username}");

        return redirect()->back()->with('success', "Admin account {$action} successfully");
    }

    public function resetPassword(int $id)
    {
        $admin = $this->teamRepo->find($id);

        if (!$admin) {
            return redirect()->back()->with('error', 'Admin not found');
        }

        $newPassword = Str::random(12);
        $this->teamRepo->update($id, ['password' => bcrypt($newPassword)]);
        $this->logActivity('reset_admin_password', 'Admin', $id, "Reset password for admin: {$admin->username}");

        return redirect()->back()->with('success', "Password reset. New password: {$newPassword}");
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
