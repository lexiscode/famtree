<?php

namespace App\Models;

use App\Models\GuestModels\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_user_id',
        'reported_user_id',
        'reason',
        'description',
        'status',
        'admin_notes',
        'reviewed_at',
        'reviewed_by_admin_id',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * The user who submitted the report
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_user_id');
    }

    /**
     * The user being reported
     */
    public function reportedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * The admin who reviewed the report
     */
    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by_admin_id');
    }
}
