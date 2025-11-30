<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\UserService;
use App\Actions\AdminServices\UserActionService;
use App\Actions\AdminServices\ChildAccountService;
use App\Actions\AdminServices\UserConnectionService;
use App\Repositories\AdminRepositories\UserRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Create controller with injected services
     */
    public function __construct(
        private UserService $userService,
        private UserActionService $userActionService,
        private ChildAccountService $childAccountService,
        private UserConnectionService $connectionService,
        private UserRepository $userRepository
    ) {
    }

    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        // Remove null and empty values from filters
        // Note: Keep string 'false' as it's a valid filter value for boolean fields
        $filters = array_filter($filters, function ($value) {
            return $value !== null && $value !== '' && $value !== 'undefined';
        });

        // Check if there are any active filters
        $hasActiveFilters = !empty($filters) || !empty($search);

        // If search query provided, use search method
        if ($search) {
            $users = $this->userService->searchUsers($search, $perPage, $page);
        } elseif ($hasActiveFilters) {
            // If filters provided, use filter method
            $filters['search'] = $search;
            $users = $this->userService->getFilteredUsers($filters, $perPage, $page);
        } else {
            // Otherwise, get all users
            $users = $this->userService->getAllUsers($perPage, $page);
        }

        // Get statistics
        $statistics = $this->userService->getUserStatistics();

        return Inertia::render('AdminPages/Users/Index', [
            'users' => $users,
            'statistics' => $statistics,
            'filters' => $filters,
            'search' => $search,
            'perPage' => $perPage,
        ]);
    }

    /**
     * Show user details
     */
    public function show(int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        return Inertia::render('AdminPages/Users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Get users data for API/AJAX (JSON response)
     */
    public function list(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $filters = $request->input('filters', []);

        if ($search) {
            $users = $this->userService->searchUsers($search, $perPage, $page);
        } elseif (!empty($filters)) {
            $filters['search'] = $search;
            $users = $this->userService->getFilteredUsers($filters, $perPage, $page);
        } else {
            $users = $this->userService->getAllUsers($perPage, $page);
        }

        return response()->json($users);
    }

    /**
     * Suspend user account
     */
    public function suspend(Request $request, int $id)
    {
        $request->validate(['reason' => 'nullable|string']);

        $success = $this->userActionService->suspendUser($id, $request->input('reason', ''));

        if ($success) {
            return redirect()->back()->with('success', 'User account suspended successfully');
        }

        return redirect()->back()->with('error', 'Failed to suspend user account');
    }

    /**
     * Unsuspend/reactivate user account
     */
    public function unsuspend(int $id)
    {
        $success = $this->userActionService->unsuspendUser($id);

        if ($success) {
            return redirect()->back()->with('success', 'User account reactivated successfully');
        }

        return redirect()->back()->with('error', 'Failed to reactivate user account');
    }

    /**
     * Deactivate user account
     */
    public function deactivate(int $id)
    {
        $success = $this->userActionService->deactivateUser($id);

        if ($success) {
            return redirect()->back()->with('success', 'User account deactivated successfully');
        }

        return redirect()->back()->with('error', 'Failed to deactivate user account');
    }

    /**
     * Ban user account
     */
    public function ban(Request $request, int $id)
    {
        $request->validate(['reason' => 'nullable|string']);

        $success = $this->userActionService->banUser($id, $request->input('reason', ''));

        if ($success) {
            return redirect()->back()->with('success', 'User account banned successfully');
        }

        return redirect()->back()->with('error', 'Failed to ban user account');
    }

    /**
     * Schedule user deletion
     */
    public function scheduleDelete(Request $request, int $id)
    {
        $request->validate(['days' => 'integer|min:1|max:365']);

        $days = $request->input('days', 30);
        $success = $this->userActionService->scheduleUserDeletion($id, $days);

        if ($success) {
            return redirect()->back()->with('success', "User account scheduled for deletion in {$days} days");
        }

        return redirect()->back()->with('error', 'Failed to schedule user deletion');
    }

    /**
     * Cancel scheduled deletion
     */
    public function cancelDelete(int $id)
    {
        $success = $this->userActionService->cancelScheduledDeletion($id);

        if ($success) {
            return redirect()->back()->with('success', 'Scheduled deletion cancelled');
        }

        return redirect()->back()->with('error', 'Failed to cancel scheduled deletion');
    }

    /**
     * Reset user password
     */
    public function resetPassword(int $id)
    {
        $success = $this->userActionService->resetUserPassword($id);

        if ($success) {
            return redirect()->back()->with('success', 'Password reset link sent to user');
        }

        return redirect()->back()->with('error', 'Failed to send password reset link');
    }

    /**
     * Disable 2FA
     */
    public function disable2FA(int $id)
    {
        $success = $this->userActionService->disable2FA($id);

        if ($success) {
            return redirect()->back()->with('success', 'Two-factor authentication disabled');
        }

        return redirect()->back()->with('error', 'Failed to disable 2FA');
    }

    /**
     * Enable 2FA
     */
    public function enable2FA(int $id)
    {
        $success = $this->userActionService->enable2FA($id);

        if ($success) {
            return redirect()->back()->with('success', 'Two-factor authentication enabled');
        }

        return redirect()->back()->with('error', 'Failed to enable 2FA');
    }

    /**
     * Complete onboarding
     */
    public function completeOnboarding(int $id)
    {
        $success = $this->userActionService->completeOnboarding($id);

        if ($success) {
            return redirect()->back()->with('success', 'Onboarding marked as complete');
        }

        return redirect()->back()->with('error', 'Failed to complete onboarding');
    }

    /**
     * Reset onboarding
     */
    public function resetOnboarding(int $id)
    {
        $success = $this->userActionService->resetOnboarding($id);

        if ($success) {
            return redirect()->back()->with('success', 'Onboarding reset successfully');
        }

        return redirect()->back()->with('error', 'Failed to reset onboarding');
    }

    /**
     * Get user action history
     */
    public function actionHistory(int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $history = $this->userActionService->getUserActionHistory($id);

        return response()->json([
            'user_id' => $id,
            'history' => $history,
        ]);
    }

    /**
     * Get child accounts for a user
     */
    public function childAccounts(int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        // Check if user can have child accounts
        if (!$this->childAccountService->canHaveChildAccounts($id)) {
            return redirect()->route('admin.users.show', $id)->with('error', 'This account cannot have child accounts');
        }

        $childAccounts = $this->childAccountService->getChildAccounts($id);
        $childStats = $this->childAccountService->getChildAccountStats($id);

        return Inertia::render('AdminPages/Users/ChildAccounts', [
            'user' => $user,
            'childAccounts' => $childAccounts,
            'childStats' => $childStats,
        ]);
    }

    /**
     * Create a new child account
     */
    public function createChildAccount(Request $request, int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        // Check if user can have child accounts
        if (!$this->childAccountService->canHaveChildAccounts($id)) {
            return redirect()->back()->with('error', 'This account cannot have child accounts');
        }

        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|unique:users|max:255',
            'email' => 'required|email|unique:users|max:255',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
        ]);

        // Validate data
        $errors = $this->childAccountService->validateChildAccountData($data);

        if (!empty($errors)) {
            return redirect()->back()->withErrors($errors)->withInput();
        }

        // Create child account
        $childAccount = $this->childAccountService->createChildAccount($id, $data);

        if ($childAccount) {
            return redirect()->route('admin.users.childAccounts', $id)
                ->with('success', "Child account '{$childAccount->username}' created successfully");
        }

        return redirect()->back()->with('error', 'Failed to create child account');
    }

    /**
     * Update child account
     */
    public function updateChildAccount(Request $request, int $parentId, int $childId)
    {
        $parent = $this->userService->getUserDetails($parentId);
        $child = $this->userService->getUserDetails($childId);

        if (!$parent || !$child) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        // Verify parent-child relationship
        if ($child['parent_user_id'] !== $parentId) {
            return redirect()->back()->with('error', 'Invalid parent-child relationship');
        }

        $data = $request->validate([
            'first_name' => 'nullable|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'bio' => 'nullable|string|max:1000',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|in:male,female,other',
        ]);

        // Update child account
        $updated = $this->childAccountService->updateChildAccount($childId, $data);

        if ($updated) {
            return redirect()->back()->with('success', 'Child account updated successfully');
        }

        return redirect()->back()->with('error', 'Failed to update child account');
    }

    /**
     * Delete child account
     */
    public function deleteChildAccount(int $parentId, int $childId)
    {
        $parent = $this->userService->getUserDetails($parentId);
        $child = $this->userService->getUserDetails($childId);

        if (!$parent || !$child) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        // Verify parent-child relationship
        if ($child['parent_user_id'] !== $parentId) {
            return redirect()->back()->with('error', 'Invalid parent-child relationship');
        }

        // Delete child account
        $deleted = $this->childAccountService->deleteChildAccount($childId);

        if ($deleted) {
            return redirect()->route('admin.users.childAccounts', $parentId)
                ->with('success', 'Child account deleted successfully');
        }

        return redirect()->back()->with('error', 'Failed to delete child account');
    }

    /**
     * Get family tree for a user
     */
    public function familyTree(int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $tree = $this->childAccountService->getFamilyTree($id);

        return response()->json($tree);
    }

    /**
     * Show user connections
     */
    public function connections(int $id)
    {
        $user = $this->userService->getUserDetails($id);

        if (!$user) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        $data = $this->connectionService->getUserConnections($id);

        return Inertia::render('AdminPages/Users/Connections', [
            'user' => [
                'id' => $user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'username' => $user['username'],
            ],
            'connections' => $data['connections'],
            'stats' => $data['stats'],
        ]);
    }

    /**
     * Remove a connection
     */
    public function removeConnection(int $parentId, int $connectionId)
    {
        $user = $this->userRepository->find($parentId);

        if (!$user) {
            return redirect()->route('admin.users.index')->with('error', 'User not found');
        }

        $removed = $this->connectionService->removeConnection($connectionId);

        if ($removed) {
            return redirect()->route('admin.users.connections', $parentId)
                ->with('success', 'Connection removed successfully');
        }

        return redirect()->back()->with('error', 'Failed to remove connection');
    }
}
