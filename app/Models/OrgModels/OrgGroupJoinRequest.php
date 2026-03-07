<?php

namespace App\Models\OrgModels;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class OrgGroupJoinRequest extends Model
{
    protected $fillable = [
        'org_group_id',
        'user_id',
        'message',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_note',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(OrgAccount::class, 'reviewed_by');
    }
}
