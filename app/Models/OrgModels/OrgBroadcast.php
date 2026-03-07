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
        'category',
        'priority',
        'message',
        'target_type',
        'target_class_set_ids',
        'schedule_type',
        'scheduled_at',
        'recurrence_type',
        'recurrence_count',
        'recurrence_ends_at',
        'recurrences_sent',
        'next_send_at',
        'status',
        'requires_approval',
        'approval_status',
        'approved_by',
        'approved_at',
        'rejection_reason',
        'is_flagged',
        'flag_reason',
        'flagged_by',
        'flagged_at',
        'sent_at',
        'sent_to_count',
        'delivery_details',
    ];

    protected $casts = [
        'target_class_set_ids' => 'json',
        'delivery_details' => 'json',
        'scheduled_at' => 'datetime',
        'recurrence_ends_at' => 'datetime',
        'next_send_at' => 'datetime',
        'sent_at' => 'datetime',
        'approved_at' => 'datetime',
        'flagged_at' => 'datetime',
        'recurrence_count' => 'integer',
        'recurrences_sent' => 'integer',
        'sent_to_count' => 'integer',
        'requires_approval' => 'boolean',
        'is_flagged' => 'boolean',
    ];

    public const CATEGORIES = [
        'announcement' => 'Announcement',
        'event' => 'Event',
        'urgent' => 'Urgent',
        'reminder' => 'Reminder',
        'academic' => 'Academic',
        'general' => 'General',
    ];

    public const PRIORITIES = [
        'normal' => 'Normal',
        'high' => 'High',
        'critical' => 'Critical',
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

    public function approver()
    {
        return $this->belongsTo(OrgAccount::class, 'approved_by');
    }

    public function flagger()
    {
        return $this->belongsTo(OrgAccount::class, 'flagged_by');
    }

    public function reads()
    {
        return $this->hasMany(OrgBroadcastRead::class);
    }

    public function needsApproval(): bool
    {
        return $this->requires_approval && $this->approval_status !== 'approved';
    }

    public function isApproved(): bool
    {
        return !$this->requires_approval || $this->approval_status === 'approved';
    }
}
