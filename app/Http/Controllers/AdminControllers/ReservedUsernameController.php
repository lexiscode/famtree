<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\ReservedUsernameService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReservedUsernameController extends Controller
{
    public function __construct(private ReservedUsernameService $service) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $search = $request->input('search', '');
        $status = $request->input('status', '');

        $reservedUsernames = $this->service->getAll($perPage, $page, $search, $status);
        $statistics = $this->service->getStats();

        return Inertia::render('AdminPages/ReservedUsernames/Index', [
            'reservedUsernames' => $reservedUsernames,
            'statistics' => $statistics,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'perPage' => $perPage,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'username' => 'required|string|min:3|max:255|unique:reserved_usernames,username',
            'celebrity_name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $reserved = $this->service->create($data);

        if ($reserved) {
            return redirect()->back()->with('success', "Username '{$data['username']}' has been reserved for {$data['celebrity_name']}.");
        }

        return redirect()->back()->with('error', 'Failed to reserve username.')->withInput();
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate([
            'celebrity_name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        $success = $this->service->update($id, $data);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Reserved username updated.' : 'Failed to update.'
        );
    }

    public function destroy(int $id)
    {
        $success = $this->service->delete($id);

        return redirect()->back()->with(
            $success ? 'success' : 'error',
            $success ? 'Reserved username removed.' : 'Failed to remove.'
        );
    }

    public function reassign(Request $request, int $id)
    {
        $data = $request->validate([
            'username' => 'required|string|exists:users,username',
        ]);

        $result = $this->service->reassignUsername($id, $data['username']);

        if ($result['success']) {
            $message = 'Username successfully reassigned.';
            if ($result['previous_holder']) {
                $prev = $result['previous_holder'];
                $message .= " Previous holder (User #{$prev['id']}) has been given the username '{$prev['new_username']}'.";
            }
            return redirect()->back()->with('success', $message);
        }

        return redirect()->back()->with('error', $result['error'] ?? 'Failed to reassign username.');
    }
}
