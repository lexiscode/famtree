<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\GlamService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlamController extends Controller
{
    public function __construct(private GlamService $glamService) {}

    /**
     * Main Glam Squad page.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        if (!$user) return redirect()->route('home');

        $seasonId = $request->input('season_id');
        $data = $this->glamService->getGlamData($user->id, $seasonId);

        return Inertia::render('GuestPages/AuthAccessPages/GlamSquad/Index', $data);
    }

    /**
     * Challenge detail page.
     */
    public function challenge(int $id)
    {
        $user = auth()->user();
        if (!$user) return redirect()->route('home');

        $data = $this->glamService->getGlamData($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/GlamSquad/Challenge', array_merge($data, [
            'challengeId' => $id,
        ]));
    }

    /**
     * Join a gendered squad.
     */
    public function joinSquad(Request $request)
    {
        $user = auth()->user();
        $data = $request->validate([
            'gender_track' => 'required|in:female,male',
        ]);

        $result = $this->glamService->joinSquad($user->id, $data['gender_track']);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Join a mixed squad.
     */
    public function joinMixed()
    {
        $user = auth()->user();
        $result = $this->glamService->joinMixedSquad($user->id);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Leave a squad.
     */
    public function leaveSquad(int $squadId)
    {
        $user = auth()->user();
        $result = $this->glamService->leaveSquad($user->id, $squadId);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Submit a challenge entry.
     */
    public function submitEntry(Request $request, int $challengeId)
    {
        $user = auth()->user();

        $data = $request->validate([
            'photo_1' => 'required|image|max:5120',
            'photo_2' => 'nullable|image|max:5120',
            'caption' => 'nullable|string|max:200',
        ]);

        $result = $this->glamService->submitEntry($user->id, $challengeId, $data);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Update an existing entry.
     */
    public function updateEntry(Request $request, int $entryId)
    {
        $user = auth()->user();

        $data = $request->validate([
            'photo_1' => 'nullable|image|max:5120',
            'photo_2' => 'nullable|image|max:5120',
            'caption' => 'nullable|string|max:200',
        ]);

        $result = $this->glamService->updateEntry($user->id, $entryId, $data);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Cast a vote on an entry.
     */
    public function vote(Request $request, int $entryId)
    {
        $user = auth()->user();

        $data = $request->validate([
            'stars' => 'required|integer|min:1|max:5',
        ]);

        $result = $this->glamService->castVote($user->id, $entryId, $data['stars']);

        return redirect()->back()->with($result['success'] ? 'success' : 'error', $result['message']);
    }

    /**
     * Get the next entry to vote on (JSON).
     */
    public function nextVote(int $challengeId)
    {
        $user = auth()->user();
        $entry = $this->glamService->getNextEntryToVote($user->id, $challengeId);

        return response()->json($entry);
    }

    /**
     * Toggle follow status.
     */
    public function toggleFollow()
    {
        $user = auth()->user();
        $result = $this->glamService->toggleFollow($user->id);

        return redirect()->back()->with('success', $result['message']);
    }

    /**
     * Challenge results page.
     */
    public function results(int $challengeId, string $track)
    {
        $user = auth()->user();
        $data = $this->glamService->getChallengeResults($challengeId, $track);

        return Inertia::render('GuestPages/AuthAccessPages/GlamSquad/Results', $data);
    }

    /**
     * Get winners for feed sidebar (JSON).
     */
    public function winners()
    {
        $winners = $this->glamService->getWinners();
        return response()->json($winners);
    }
}
