<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'fixture_id',
        'user_id',
        'prediction_type',
        'prediction_value',
        'predicted_home_score',
        'predicted_away_score',
        'is_correct',
        'points_earned',
        'is_locked',
    ];

    protected $casts = [
        'predicted_home_score' => 'integer',
        'predicted_away_score' => 'integer',
        'is_correct' => 'boolean',
        'points_earned' => 'integer',
        'is_locked' => 'boolean',
    ];

    public function fixture()
    {
        return $this->belongsTo(PredictionFixture::class, 'fixture_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
