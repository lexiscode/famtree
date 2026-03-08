<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Model;
use App\Models\GuestModels\User;

class OrgGroupPoll extends Model
{
    protected $table = 'org_group_polls';

    protected $fillable = [
        'org_group_id',
        'created_by',
        'question',
        'description',
        'poll_type',
        'is_anonymous',
        'show_results_before_vote',
        'is_active',
        'expires_at',
        'closed_at',
        'closed_by',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'show_results_before_vote' => 'boolean',
        'is_active' => 'boolean',
        'expires_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function closer()
    {
        return $this->belongsTo(User::class, 'closed_by');
    }

    public function options()
    {
        return $this->hasMany(OrgGroupPollOption::class)->orderBy('sort_order');
    }

    public function votes()
    {
        return $this->hasMany(OrgGroupPollVote::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isClosed(): bool
    {
        return $this->closed_at !== null || $this->isExpired() || !$this->is_active;
    }
}
