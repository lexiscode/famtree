<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Family extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'state',
        'lga',
        'village',
        'founder',
        'member_count',
        'story',
        'cover_image',
        'founded_year',
        'new_members_this_year',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'founded_year' => 'integer',
        'member_count' => 'integer',
        'new_members_this_year' => 'integer',
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }
}
