<?php

namespace App\Models\AdminModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReservedUsername extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'celebrity_name',
        'notes',
        'status',
        'claimed_by',
        'claimed_at',
    ];

    protected $casts = [
        'claimed_at' => 'datetime',
    ];

    public function claimedByUser()
    {
        return $this->belongsTo(User::class, 'claimed_by');
    }
}
