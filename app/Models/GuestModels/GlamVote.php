<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GlamVote extends Model
{
    use HasFactory;

    protected $fillable = [
        'entry_id',
        'voter_id',
        'stars',
    ];

    protected $casts = [
        'stars' => 'integer',
    ];

    public function entry()
    {
        return $this->belongsTo(GlamEntry::class, 'entry_id');
    }

    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }
}
