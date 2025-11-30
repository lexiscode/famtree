<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\AdminModels\Admin;

class AdminActivityLog extends Model
{
    use HasFactory;

    protected $table = 'admin_activity_logs';

    protected $fillable = [
        'admin_id',
        'action_type',
        'resource_type',
        'resource_id',
        'description',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    /**
     * Relationship: Belongs to Admin
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
