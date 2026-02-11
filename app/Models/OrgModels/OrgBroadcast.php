<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class OrgBroadcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'organization_id',
        'org_account_id',
        'title',
        'message',
        'target_type',
        'target_class_set_ids',
        'schedule_type',
        'scheduled_at',
        'recurrence_type',
        'recurrence_count',
        'recurrences_sent',
        'next_send_at',
        'status',
        'sent_at',
        'sent_to_count',
    ];

    protected $casts = [
        'target_class_set_ids' => 'json',
        'scheduled_at' => 'datetime',
        'next_send_at' => 'datetime',
        'sent_at' => 'datetime',
        'recurrence_count' => 'integer',
        'recurrences_sent' => 'integer',
        'sent_to_count' => 'integer',
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

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function creator()
    {
        return $this->belongsTo(OrgAccount::class, 'org_account_id');
    }
}
