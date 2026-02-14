<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionGameweekStanding extends Model
{
    use HasFactory;

    protected $fillable = [
        'gameweek_id',
        'user_id',
        'points',
        'predictions_made',
        'correct_predictions',
    ];

    protected $casts = [
        'points' => 'integer',
        'predictions_made' => 'integer',
        'correct_predictions' => 'integer',
    ];

    public function gameweek()
    {
        return $this->belongsTo(PredictionGameweek::class, 'gameweek_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
