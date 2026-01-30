<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSetMember extends Model
{
    use HasFactory;

    protected $fillable = [
        'class_set_id',
        'user_id',
        'joined_at',
        'is_admin',
        'last_read_at',
    ];

    protected $casts = [
        'is_admin' => 'boolean',
        'joined_at' => 'datetime',
        'last_read_at' => 'datetime',
    ];

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
