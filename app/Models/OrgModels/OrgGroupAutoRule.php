<?php

namespace App\Models\OrgModels;

use Illuminate\Database\Eloquent\Model;

class OrgGroupAutoRule extends Model
{
    protected $fillable = [
        'org_group_id',
        'rule_type',
        'target_id',
        'target_name',
        'is_active',
        'created_by',
        'last_run_count',
        'last_run_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_run_count' => 'integer',
        'last_run_at' => 'datetime',
    ];

    public const RULE_TYPES = [
        'class_set' => 'Class Set Members',
        'faculty' => 'Faculty Members',
        'all_followers' => 'All Org Followers',
    ];

    public function orgGroup()
    {
        return $this->belongsTo(OrgGroup::class);
    }

    public function creator()
    {
        return $this->belongsTo(OrgAccount::class, 'created_by');
    }
}
