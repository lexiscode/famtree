<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlamSquadMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'squad_id',
        'user_id',
        'is_admin',
        'is_muted',
        'joined_at',
        'last_read_at',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'is_muted' => 'boolean',
        'joined_at' => 'datetime',
        'last_read_at' => 'datetime',
    ];

    public function squad()
    {
        return $this->belongsTo(GlamSquad::class, 'squad_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
