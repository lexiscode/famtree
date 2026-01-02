<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\ChildAccountService;
use App\Repositories\GuestRepositories\ChildAccountRepository;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ChildAccountController extends Controller
{
    public function __construct(
        private ChildAccountService $childAccountService,
        private ChildAccountRepository $childAccountRepository,
    ) {}

    /**
     * Show child accounts management page
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check if user is eligible to manage child accounts
        if (!$this->childAccountService->canManageChildAccounts($user)) {
            return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/AgeRestricted', [
                'currentAge' => $this->getAge($user->date_of_birth),
                'requiredAge' => 18,
            ]);
        }

        $childAccounts = $this->childAccountService->getParentChildAccounts($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/ManageChildren', [
            'childAccounts' => $childAccounts,
            'childCount' => count($childAccounts),
        ]);
    }

    /**
     * Show create child account form
     */
    public function create()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check if user is eligible to manage child accounts
        if (!$this->childAccountService->canManageChildAccounts($user)) {
            return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/AgeRestricted', [
                'currentAge' => $this->getAge($user->date_of_birth),
                'requiredAge' => 18,
            ]);
        }

        return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/CreateChild', [
            'parentName' => $user->first_name . ' ' . $user->last_name,
        ]);
    }

    /**
     * Store a new child account
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Check if user is eligible
        if (!$this->childAccountService->canManageChildAccounts($user)) {
            abort(403, 'You must be 18 or older to create child accounts.');
        }

        // Validate input
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'gender' => 'required|in:male,female',
            'date_of_birth' => 'required|date|before_or_equal:today',
        ]);

        try {
            // Create child account
            $result = $this->childAccountService->createChildAccount($user->id, $validated);

            // Store temporary password in session for display
            session()->put('child_temp_password', $result['temporary_password']);

            return redirect()->route('child-accounts.show-credentials', ['childId' => $result['child_account']->id])
                ->with('success', 'Child account created successfully!');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Show credentials for newly created child account
     */
    public function showCredentials($childId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child || $child->parent_user_id !== $user->id) {
            abort(403, 'Unauthorized to view these credentials.');
        }

        // Get temporary password from session
        $temporaryPassword = session('child_temp_password');

        if (!$temporaryPassword) {
            return redirect()->route('child-accounts.index')
                ->withErrors(['error' => 'Credentials not found. Please create a new account.']);
        }

        return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/ChildCredentials', [
            'child' => [
                'id' => $child->id,
                'first_name' => $child->first_name,
                'last_name' => $child->last_name,
                'full_name' => $child->first_name . ' ' . $child->last_name,
                'username' => $child->username,
            ],
            'temporaryPassword' => $temporaryPassword,
        ]);
    }

    /**
     * Get child accounts list
     */
    public function getChildren()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $childAccounts = $this->childAccountService->getParentChildAccounts($user->id);

        return response()->json([
            'children' => $childAccounts,
            'count' => count($childAccounts),
        ]);
    }

    /**
     * Remove a child account
     */
    public function destroy($childId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        try {
            $this->childAccountService->removeChildAccount($user->id, $childId);

            return redirect()->route('child-accounts.index')
                ->with('success', 'Child account removed successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    /**
     * Set email for child when they come of age
     */
    public function setEmail(Request $request, $childId)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Verify the request is from the child account themselves
        if ($user->id !== $childId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'email' => 'required|string|email|max:255|unique:users,email,' . $childId,
        ]);

        try {
            $result = $this->childAccountService->setChildEmailAtAge($childId, $validated['email']);

            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        }
    }

    /**
     * Get child account details
     */
    public function show($childId)
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        $child = $this->childAccountRepository->getChildAccount($childId);

        if (!$child) {
            abort(404, 'Child account not found.');
        }

        // Check authorization: must be parent or the child themselves
        if ($child->parent_user_id !== $user->id && $user->id !== $childId) {
            abort(403, 'Unauthorized to view this child account.');
        }

        $childDetails = $this->childAccountService->getChildAccountDetails($childId);

        return Inertia::render('GuestPages/AuthAccessPages/ChildAccounts/ViewChild', [
            'child' => $childDetails,
        ]);
    }

    /**
     * Calculate age from date of birth
     */
    private function getAge($dateOfBirth)
    {
        if (!$dateOfBirth) {
            return null;
        }

        $date = new \DateTime($dateOfBirth);
        $today = new \DateTime();
        return $today->diff($date)->y;
    }
}
