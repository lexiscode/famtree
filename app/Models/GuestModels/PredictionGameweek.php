<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionGameweek extends Model
{
    use HasFactory;

    protected $fillable = [
        'season_id',
        'number',
        'label',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'number' => 'integer',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function season()
    {
        return $this->belongsTo(PredictionSeason::class, 'season_id');
    }

    public function fixtures()
    {
        return $this->hasMany(PredictionFixture::class, 'gameweek_id');
    }

    public function standings()
    {
        return $this->hasMany(PredictionGameweekStanding::class, 'gameweek_id');
    }
}
