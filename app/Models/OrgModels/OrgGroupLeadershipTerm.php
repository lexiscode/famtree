<?php

namespace App\Models\OrgModels;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OrgGroupLeadershipTerm extends Model
{
    protected $table = 'org_group_leadership_terms';

    protected $fillable = [
        'org_group_id',
        'user_id',
        'role',
        'term_name',
        'started_at',
        'ended_at',
        'is_current',
        'handover_notes',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
