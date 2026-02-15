<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupElection extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_set_id',
        'type',
        'status',
        'positions_to_fill',
        'parent_election_id',
        'started_at',
        'ends_at',
    ];

    protected $casts = [
        'positions_to_fill' => 'integer',
        'started_at' => 'datetime',
        'ends_at' => 'datetime',
    ];

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }

    public function candidates()
    {
        return $this->hasMany(GroupElectionCandidate::class, 'election_id');
    }

    public function votes()
    {
        return $this->hasMany(GroupElectionVote::class, 'election_id');
    }

    public function parentElection()
    {
        return $this->belongsTo(GroupElection::class, 'parent_election_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function hasEnded(): bool
    {
        return $this->ends_at->isPast();
    }
}
