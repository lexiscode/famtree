<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;

class OrgGroupPollVote extends Model
{
    protected $table = 'org_group_poll_votes';

    protected $fillable = [
        'org_group_poll_id',
        'org_group_poll_option_id',
        'user_id',
    ];

    public function poll()
    {
        return $this->belongsTo(OrgGroupPoll::class, 'org_group_poll_id');
    }

    public function option()
    {
        return $this->belongsTo(OrgGroupPollOption::class, 'org_group_poll_option_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
