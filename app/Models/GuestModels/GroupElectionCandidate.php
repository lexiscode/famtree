<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupElectionCandidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'election_id',
        'user_id',
        'votes_count',
    ];

    protected $casts = [
        'votes_count' => 'integer',
    ];

    public function election()
    {
        return $this->belongsTo(GroupElection::class, 'election_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
