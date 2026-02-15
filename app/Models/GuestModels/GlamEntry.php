<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GlamEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'challenge_id',
        'user_id',
        'squad_id',
        'gender_track',
        'photo_1',
        'photo_2',
        'caption',
        'avg_rating',
        'vote_count',
        'weighted_score',
        'rank',
        'is_qualified',
    ];

    protected $casts = [
        'avg_rating' => 'decimal:2',
        'vote_count' => 'integer',
        'weighted_score' => 'decimal:2',
        'rank' => 'integer',
        'is_qualified' => 'boolean',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function challenge()
    {
        return $this->belongsTo(GlamChallenge::class, 'challenge_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function squad()
    {
        return $this->belongsTo(GlamSquad::class, 'squad_id');
    }

    public function votes()
    {
        return $this->hasMany(GlamVote::class, 'entry_id');
    }
}
