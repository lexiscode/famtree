<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlamStanding extends Model
{
    use HasFactory;

    protected $fillable = [
        'season_id',
        'user_id',
        'gender_track',
        'total_points',
        'challenges_entered',
        'votes_cast',
        'top_1_count',
        'top_3_count',
        'current_entry_streak',
        'best_entry_streak',
        'streak_bonus_points',
    ];

    protected $casts = [
        'total_points' => 'integer',
        'challenges_entered' => 'integer',
        'votes_cast' => 'integer',
        'top_1_count' => 'integer',
        'top_3_count' => 'integer',
        'current_entry_streak' => 'integer',
        'best_entry_streak' => 'integer',
        'streak_bonus_points' => 'integer',
    ];

    public function season()
    {
        return $this->belongsTo(GlamSeason::class, 'season_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
