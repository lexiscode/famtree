<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Model;

class OrgPostCommentLike extends Model
{
    protected $table = 'org_post_comment_likes';

    protected $fillable = [
        'comment_id',
        'user_id',
        'org_account_id',
    ];

    public function comment()
    {
        return $this->belongsTo(OrgPostComment::class, 'comment_id');
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
