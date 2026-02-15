<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class GlamChallenge extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'season_id',
        'title',
        'description',
        'theme',
        'banner_image',
        'status',
        'submissions_open_at',
        'submissions_close_at',
        'voting_open_at',
        'voting_close_at',
        'results_at',
        'challenge_number',
    ];

    protected $casts = [
        'submissions_open_at' => 'datetime',
        'submissions_close_at' => 'datetime',
        'voting_open_at' => 'datetime',
        'voting_close_at' => 'datetime',
        'results_at' => 'datetime',
        'challenge_number' => 'integer',
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

    public function season()
    {
        return $this->belongsTo(GlamSeason::class, 'season_id');
    }

    public function entries()
    {
        return $this->hasMany(GlamEntry::class, 'challenge_id');
    }

    public function isSubmissionsOpen(): bool
    {
        return $this->status === 'submissions_open';
    }

    public function isVotingOpen(): bool
    {
        return $this->status === 'voting_open';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }
}
