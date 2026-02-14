<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionStanding extends Model
{
    use HasFactory;

    protected $fillable = [
        'season_id',
        'user_id',
        'total_points',
        'predictions_made',
        'correct_predictions',
        'current_streak',
        'best_streak',
        'streak_bonus_points',
        'match_result_correct',
        'double_chance_correct',
        'correct_score_correct',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'predictions_made' => 'integer',
        'correct_predictions' => 'integer',
        'current_streak' => 'integer',
        'best_streak' => 'integer',
        'streak_bonus_points' => 'integer',
        'match_result_correct' => 'integer',
        'double_chance_correct' => 'integer',
        'correct_score_correct' => 'integer',
    ];

    public function season()
    {
        return $this->belongsTo(PredictionSeason::class, 'season_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function accuracy(): float
    {
        if ($this->predictions_made === 0) return 0;
        return round(($this->correct_predictions / $this->predictions_made) * 100, 1);
    }
}
