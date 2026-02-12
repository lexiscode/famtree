<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Model;

class OrgPostReaction extends Model
{
    protected $fillable = [
        'org_post_id',
        'user_id',
        'org_account_id',
        'reaction_type',
    ];

    public function orgPost()
    {
        return $this->belongsTo(OrgPost::class, 'org_post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function orgAccount()
    {
        return $this->belongsTo(OrgAccount::class, 'org_account_id');
    }
}
