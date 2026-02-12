<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;

class GroupElectionVote extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'election_id',
        'voter_id',
        'candidate_id',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function election()
    {
        return $this->belongsTo(GroupElection::class, 'election_id');
    }

    public function voter()
    {
        return $this->belongsTo(User::class, 'voter_id');
    }

    public function candidate()
    {
        return $this->belongsTo(User::class, 'candidate_id');
    }
}
