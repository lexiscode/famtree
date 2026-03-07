<?php

namespace App\Models\OrgModels;

use App\Models\User;
use App\Models\GuestModels\ClassSet;
use Illuminate\Database\Eloquent\Model;

class OrgBroadcastRead extends Model
{
    public $timestamps = false;

    protected $table = 'org_broadcast_reads';

    protected $fillable = [
        'org_broadcast_id',
        'class_set_id',
        'user_id',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function broadcast()
    {
        return $this->belongsTo(OrgBroadcast::class, 'org_broadcast_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function classSet()
    {
        return $this->belongsTo(ClassSet::class);
    }
}
