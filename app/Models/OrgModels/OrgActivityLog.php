<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrgActivityLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'org_account_id',
        'organization_id',
        'action_type',
        'resource_type',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function orgAccount()
    {
        return $this->belongsTo(OrgAccount::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
