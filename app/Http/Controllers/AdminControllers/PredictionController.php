<?php

namespace App\Http\Controllers\AdminControllers;

use App\Http\Controllers\Controller;
use App\Actions\AdminServices\PredictionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PredictionController extends Controller
{
    public function __construct(private PredictionService $predictionService) {}

    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $page = $request->input('page', 1);
        $seasons = $this->predictionService->getAllSeasons($perPage, $page);

        return Inertia::render('AdminPages/Predictions/Index', [
            'seasons' => $seasons,
            'statistics' => $this->predictionService->getStats(),
            'perPage' => $perPage,
        ]);
    }

    public function create()
    {
        return Inertia::render('AdminPages/Predictions/Create', [
            'organizations' => $this->predictionService->getFootballOrganizations(),
        ]);
    }

    public function storeSeason(Request $request)
    {
        $data = $request->validate([
            'organization_id' => 'required|integer|exists:organizations,id',
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $success = $this->predictionService->createSeason($data);
        if ($success) {
            return redirect()->route('admin.predictions.index')->with('success', 'Prediction season created successfully');
        }
        return redirect()->back()->with('error', 'Failed to create prediction season')->withInput();
    }

    public function show(int $id)
    {
        $season = $this->predictionService->getSeasonDetails($id);
        if (!$season) {
            return redirect()->route('admin.predictions.index')->with('error', 'Season not found');
        }

        return Inertia::render('AdminPages/Predictions/Show', [
            'season' => $season,
            'standings' => $this->predictionService->getSeasonStandings($id),
            'badges' => $this->predictionService->getSeasonBadges($id),
        ]);
    }

    public function edit(int $id)
    {
        $season = $this->predictionService->getSeasonDetails($id);
        if (!$season) {
            return redirect()->route('admin.predictions.index')->with('error', 'Season not found');
        }

        return Inertia::render('AdminPages/Predictions/Edit', [
            'season' => $season,
            'organizations' => $this->predictionService->getFootballOrganizations(),
        ]);
    }

    public function updateSeason(Request $request, int $id)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
        ]);

        $success = $this->predictionService->updateSeason($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season updated successfully' : 'Failed to update season');
    }

    public function activateSeason(int $id)
    {
        $success = $this->predictionService->activateSeason($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season activated' : 'Failed to activate season');
    }

    public function completeSeason(int $id)
    {
        $success = $this->predictionService->completeSeason($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Season completed' : 'Failed to complete season');
    }

    public function storeGameweek(Request $request, int $seasonId)
    {
        $data = $request->validate([
            'number' => 'nullable|integer|min:1',
            'label' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $success = $this->predictionService->createGameweek($seasonId, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Gameweek created' : 'Failed to create gameweek');
    }

    public function updateGameweek(Request $request, int $id)
    {
        $data = $request->validate([
            'label' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $success = $this->predictionService->updateGameweek($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Gameweek updated' : 'Failed to update gameweek');
    }

    public function storeFixture(Request $request, int $seasonId)
    {
        $data = $request->validate([
            'opponent_name' => 'required|string|max:255',
            'opponent_logo' => 'nullable|string|max:500',
            'venue' => 'required|in:home,away',
            'competition' => 'nullable|string|max:255',
            'match_date' => 'required|date',
            'gameweek_id' => 'nullable|integer|exists:prediction_gameweeks,id',
        ]);

        $success = $this->predictionService->createFixture($seasonId, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Fixture created' : 'Failed to create fixture');
    }

    public function updateFixture(Request $request, int $id)
    {
        $data = $request->validate([
            'opponent_name' => 'required|string|max:255',
            'opponent_logo' => 'nullable|string|max:500',
            'venue' => 'required|in:home,away',
            'competition' => 'nullable|string|max:255',
            'match_date' => 'required|date',
            'gameweek_id' => 'nullable|integer|exists:prediction_gameweeks,id',
        ]);

        $success = $this->predictionService->updateFixture($id, $data);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Fixture updated' : 'Failed to update fixture');
    }

    public function enterResult(Request $request, int $id)
    {
        $data = $request->validate([
            'home_score' => 'required|integer|min:0|max:99',
            'away_score' => 'required|integer|min:0|max:99',
        ]);

        $success = $this->predictionService->enterResult($id, $data['home_score'], $data['away_score']);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Result entered and predictions scored' : 'Failed to enter result');
    }

    public function cancelFixture(int $id)
    {
        $success = $this->predictionService->cancelFixture($id);
        return redirect()->back()->with($success ? 'success' : 'error', $success ? 'Fixture cancelled' : 'Failed to cancel fixture');
    }

    public function standings(int $seasonId)
    {
        return response()->json($this->predictionService->getSeasonStandings($seasonId));
    }

    public function badges(int $seasonId)
    {
        return response()->json($this->predictionService->getSeasonBadges($seasonId));
    }
}
