<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\GlamService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlamController extends Controller
{
    public function __construct(private GlamService $glamService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $seasons = $this->glamService->getAllSeasons($perPage, $page);

        return Inertia::render('AdminPages/GlamSquad/Index', [
            'seasons' => $seasons,
            'statistics' => $this->glamService->getStats(),
            'perPage' => $perPage,
        ]);
    }

    public function create()
    {
        return Inertia::render('AdminPages/GlamSquad/Create');
    }

    public function storeSeason(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $success = $this->glamService->createSeason($data);
        if ($success) {
            return redirect()->route('admin.glam.index')->with('success', 'Glam season created successfully');
        }
        return redirect()->back()->with('error', 'Failed to create glam season')->withInput();
    }

    public function show(int $id)
    {
        $season = $this->glamService->getSeasonDetails($id);
        if (!$season) {
            return redirect()->route('admin.glam.index')->with('error', 'Season not found');
        }

        return Inertia::render('AdminPages/GlamSquad/Show', [
            'season' => $season,
        ]);
    }

    public function edit(int $id)
    {
        $season = $this->glamService->getSeasonDetails($id);
        if (!$season) {
            return redirect()->route('admin.glam.index')->with('error', 'Season not found');
        }

        return Inertia::render('AdminPages/GlamSquad/Edit', [
            'season' => $season,
        ]);
    }

    public function updateSeason(Request $request, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $success = $this->glamService->updateSeason($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season updated successfully' : 'Failed to update season');
    }

    public function activateSeason(int $id)
    {
        $success = $this->glamService->activateSeason($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season activated' : 'Failed to activate season');
    }

    public function completeSeason(int $id)
    {
        $success = $this->glamService->completeSeason($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season completed' : 'Failed to complete season');
    }

    public function storeChallenge(Request $request, int $seasonId)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'theme' => 'nullable|string|max:255',
            'banner_image_file' => 'nullable|image|max:5120',
            'submissions_open_at' => 'required|date',
            'submissions_close_at' => 'required|date|after:submissions_open_at',
            'voting_open_at' => 'required|date|after_or_equal:submissions_close_at',
            'voting_close_at' => 'required|date|after:voting_open_at',
            'results_at' => 'required|date|after_or_equal:voting_close_at',
        ]);

        $success = $this->glamService->createChallenge($seasonId, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Challenge created' : 'Failed to create challenge');
    }

    public function updateChallenge(Request $request, int $id)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'theme' => 'nullable|string|max:255',
            'banner_image_file' => 'nullable|image|max:5120',
            'submissions_open_at' => 'required|date',
            'submissions_close_at' => 'required|date|after:submissions_open_at',
            'voting_open_at' => 'required|date|after_or_equal:submissions_close_at',
            'voting_close_at' => 'required|date|after:voting_open_at',
            'results_at' => 'required|date|after_or_equal:voting_close_at',
        ]);

        $success = $this->glamService->updateChallenge($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Challenge updated' : 'Failed to update challenge');
    }

    public function transitionChallenge(Request $request, int $id)
    {
        $data = $request->validate([
            'status' => 'required|in:upcoming,submissions_open,voting_open,completed',
        ]);

        $success = $this->glamService->transitionChallenge($id, $data['status']);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Challenge status updated' : 'Failed to update challenge status');
    }

    public function calculateResults(int $id)
    {
        try {
            $scoringService = app(\App\Actions\GuestServices\AuthAccessServices\GlamScoringService::class);
            $scoringService->scoreChallenge($id);
            return redirect()->back()->with('success', 'Results calculated successfully');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to calculate results');
        }
    }

    public function squads()
    {
        return Inertia::render('AdminPages/GlamSquad/Squads', [
            'squads' => $this->glamService->getAllSquads(),
        ]);
    }

    public function showSquad(int $id)
    {
        $squad = $this->glamService->getSquadDetails($id);
        if (!$squad) {
            return redirect()->route('admin.glam.squads')->with('error', 'Squad not found');
        }

        return Inertia::render('AdminPages/GlamSquad/SquadDetail', [
            'squad' => $squad,
        ]);
    }

    public function removeSquadMember(Request $request, int $squadId)
    {
        $data = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $success = $this->glamService->removeSquadMember($squadId, $data['user_id']);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Member removed' : 'Failed to remove member');
    }

    public function standings(int $seasonId, string $track)
    {
        return response()->json($this->glamService->getSeasonStandings($seasonId, $track));
    }

    public function badges(int $seasonId)
    {
        return response()->json($this->glamService->getSeasonBadges($seasonId));
    }
}
