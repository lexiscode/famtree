<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionSeason extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'organization_id',
        'name',
        'slug',
        'status',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function gameweeks()
    {
        return $this->hasMany(PredictionGameweek::class, 'season_id')->orderBy('number');
    }

    public function fixtures()
    {
        return $this->hasMany(PredictionFixture::class, 'season_id');
    }

    public function standings()
    {
        return $this->hasMany(PredictionStanding::class, 'season_id');
    }

    public function userBadges()
    {
        return $this->hasMany(PredictionUserBadge::class, 'season_id');
    }

    public function groupStandings()
    {
        return $this->hasMany(PredictionGroupStanding::class, 'season_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
