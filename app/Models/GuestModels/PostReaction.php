<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostReaction extends Model
{
    use HasFactory;

    protected $table = 'post_reactions';

    protected $fillable = [
        'post_id',
        'user_id',
        'reaction_type',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the post this reaction belongs to
     */
    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * Get the user who reacted
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
