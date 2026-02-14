<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionGroupStanding extends Model
{
    use HasFactory;

    protected $fillable = [
        'season_id',
        'class_set_id',
        'user_id',
        'total_points',
        'predictions_made',
        'correct_predictions',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'predictions_made' => 'integer',
        'correct_predictions' => 'integer',
    ];

    public function season()
    {
        return $this->belongsTo(PredictionSeason::class, 'season_id');
    }

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
