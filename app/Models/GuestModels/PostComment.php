<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PostComment extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'post_comments';

    protected $fillable = [
        'post_id',
        'user_id',
        'content',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the post this comment belongs to
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who created this comment
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
