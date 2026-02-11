<?php

namespace App\Models\GuestModels;

use App\Models\OrgModels\OrgPost;
use Illuminate\Database\Eloquent\Model;

class PostSave extends Model
{
    protected $fillable = [
        'post_id',
        'org_post_id',
        'user_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function orgPost()
    {
        return $this->belongsTo(OrgPost::class);
    }
}
