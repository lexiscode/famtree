<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\PredictionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PredictionController extends Controller
{
    public function __construct(private PredictionService $predictionService) {}

    /**
     * Show the prediction league page for an organization.
     */
    public function index(Request $request, string $slug)
    {
        $user = auth()->user();
        if (!$user) return redirect()->route('home');

        $seasonId = $request->input('season_id');
        $data = $this->predictionService->getLeagueData($slug, $user->id, $seasonId);

        if (!$data) {
            return redirect()->route('organizations.show', $slug)
                ->with('error', 'Prediction league is not available for this organization');
        }

        return Inertia::render('GuestPages/AuthAccessPages/Organizations/Predictions/Index', $data);
    }

    /**
     * Submit a prediction.
     */
    public function predict(Request $request, string $slug)
    {
        $user = auth()->user();
        if (!$user) return redirect()->route('home');

        $data = $request->validate([
            'fixture_id' => 'required|integer|exists:prediction_fixtures,id',
            'prediction_type' => 'required|in:match_result,double_chance,correct_score',
            'prediction_value' => 'nullable|string',
            'predicted_home_score' => 'nullable|integer|min:0|max:99',
            'predicted_away_score' => 'nullable|integer|min:0|max:99',
        ]);

        $result = $this->predictionService->submitPrediction($slug, $user->id, $data);

        return redirect()->back()->with(
            $result['success'] ? 'success' : 'error',
            $result['message']
        );
    }

    /**
     * Get prediction history.
     */
    public function history(Request $request, string $slug)
    {
        $user = auth()->user();
        if (!$user) return redirect()->route('home');

        $seasonId = $request->input('season_id');
        $history = $this->predictionService->getUserHistory($slug, $user->id, $seasonId);

        return response()->json($history);
    }

    /**
     * Get open fixtures for a class set (for group chat banner).
     */
    public function openFixtures(string $classSetUuid)
    {
        $user = auth()->user();
        if (!$user) return response()->json([]);

        $data = $this->predictionService->getOpenFixturesForClassSet($classSetUuid, $user->id);

        return response()->json($data);
    }

    /**
     * Get mini-league standings for a class set.
     */
    public function groupStandings(string $classSetUuid)
    {
        $data = $this->predictionService->getGroupStandings($classSetUuid);
        return response()->json($data);
    }
}
