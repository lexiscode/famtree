<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PostComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'post_comments';

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
        'uuid',
        'parent_comment_id',
        'likes_count',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
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

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
        return $this->hasMany(PostCommentLike::class, 'comment_id');
    }

    public function isReply(): bool
    {
        return !is_null($this->parent_comment_id);
    }
}
