<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class GlamSquadMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'squad_id',
        'sender_id',
        'message',
        'is_edited',
        'edited_at',
        'reply_to_id',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }

    public function squad()
    {
        return $this->belongsTo(GlamSquad::class, 'squad_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Get the message this is a reply to
     */
    public function repliedMessage(): BelongsTo
    {
        return $this->belongsTo(GlamSquadMessage::class, 'reply_to_id');
    }
}
