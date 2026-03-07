<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Model;

class OrgGroupPollOption extends Model
{
    protected $table = 'org_group_poll_options';

    protected $fillable = [
        'org_group_poll_id',
        'label',
        'sort_order',
    ];

    public function poll()
    {
        return $this->belongsTo(OrgGroupPoll::class, 'org_group_poll_id');
    }

    public function votes()
    {
        return $this->hasMany(OrgGroupPollVote::class);
    }
}
