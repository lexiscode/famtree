<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PredictionUserBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'badge_id',
        'user_id',
        'season_id',
        'times_earned',
        'earned_at',
    ];

    protected $casts = [
        'times_earned' => 'integer',
        'earned_at' => 'datetime',
    ];

    public function badge()
    {
        return $this->belongsTo(PredictionBadge::class, 'badge_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function season()
    {
        return $this->belongsTo(PredictionSeason::class, 'season_id');
    }
}
