<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ClassSetMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'class_set_id',
        'sender_id',
        'message',
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

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
