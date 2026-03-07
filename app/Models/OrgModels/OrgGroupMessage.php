<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\User;

class OrgGroupMessage extends Model
{
    use SoftDeletes;

    protected $table = 'org_group_messages';

    protected $fillable = [
        'org_group_id',
        'user_id',
        'message',
        'message_type',
        'attachment_url',
        'attachment_name',
        'reply_to_id',
        'is_pinned',
        'pinned_by',
        'pinned_at',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'pinned_at' => 'datetime',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replyTo()
    {
        return $this->belongsTo(self::class, 'reply_to_id');
    }

    public function replies()
    {
        return $this->hasMany(self::class, 'reply_to_id');
    }

    public function pinner()
    {
        return $this->belongsTo(User::class, 'pinned_by');
    }
}
