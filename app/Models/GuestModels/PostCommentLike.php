<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Model;

class PostCommentLike extends Model
{
    protected $fillable = [
        'comment_id',
        'user_id',
    ];

    public function comment()
    {
        return $this->belongsTo(PostComment::class, 'comment_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
