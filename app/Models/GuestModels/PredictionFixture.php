<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionFixture extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'organization_id',
        'season_id',
        'gameweek_id',
        'opponent_name',
        'opponent_logo',
        'venue',
        'competition',
        'match_date',
        'status',
        'home_score',
        'away_score',
    ];

    protected $casts = [
        'match_date' => 'datetime',
        'home_score' => 'integer',
        'away_score' => 'integer',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function season()
    {
        return $this->belongsTo(PredictionSeason::class, 'season_id');
    }

    public function gameweek()
    {
        return $this->belongsTo(PredictionGameweek::class, 'gameweek_id');
    }

    public function entries()
    {
        return $this->hasMany(PredictionEntry::class, 'fixture_id');
    }

    public function isUpcoming(): bool
    {
        return $this->status === 'upcoming';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isLocked(): bool
    {
        return $this->match_date->isPast() || $this->status !== 'upcoming';
    }
}
