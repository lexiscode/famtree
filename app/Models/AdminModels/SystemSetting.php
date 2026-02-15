<?php

namespace App\Models\AdminModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSetting extends Model
{
    use HasFactory;

    protected $table = 'system_settings';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'key',
        'value',
        'group',
        'description',
        'is_editable',
        'updated_by_admin_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'value' => 'json',
        'is_editable' => 'boolean',
    ];

    /**
     * Relationship: Updated by admin
     */
    public function updatedBy()
    {
        return $this->belongsTo(Admin::class, 'updated_by_admin_id');
    }

    /**
     * Scope: Get only editable settings
     */
    public function scopeEditable($query)
    {
        return $query->where('is_editable', true);
    }

    /**
     * Scope: Get settings by group
     */
    public function scopeByGroup($query, string $group)
    {
        return $query->where('group', $group);
    }
}
