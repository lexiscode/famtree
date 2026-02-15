<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlamBadge extends Model
{
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'color',
    ];

    public function userBadges()
    {
        return $this->hasMany(GlamUserBadge::class, 'badge_id');
    }
}
