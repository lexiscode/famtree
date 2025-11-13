<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserFamilyInfo extends Model
{
    use HasFactory;

    protected $table = 'user_family_info';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'family_status',
        'number_of_siblings',
        'number_of_children',
        'city',
        'state_province',
        'country',
        'education_level',
        'current_occupation',
        'has_searched_siblings',
        'completed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'has_searched_siblings' => 'boolean',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that this family info belongs to
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
