<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrganizationFollow extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }
}
