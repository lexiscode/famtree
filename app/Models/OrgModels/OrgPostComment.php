<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OrgPostComment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'org_post_id',
        'user_id',
        'org_account_id',
        'content',
        'uuid',
        'parent_comment_id',
        'likes_count',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($comment) {
            if (empty($comment->uuid)) {
                $comment->uuid = (string) Str::uuid();
            }
        });
    }

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

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_comment_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'parent_comment_id')->orderBy('created_at', 'asc');
    }

    public function likes()
    {
        return $this->hasMany(OrgPostCommentLike::class, 'comment_id');
    }

    public function isReply(): bool
    {
        return !is_null($this->parent_comment_id);
    }
}
