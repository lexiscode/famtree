<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OnboardingStep extends Model
{
    use HasFactory;

    protected $table = 'onboarding_steps';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'step_name',
        'is_completed',
        'step_data',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_completed' => 'boolean',
        'step_data' => 'json',
    ];

    /**
     * Get the user that this onboarding step belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
