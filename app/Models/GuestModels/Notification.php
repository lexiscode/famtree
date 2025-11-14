<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'type',
        'related_user_id',
        'related_object_id',
        'related_object_type',
        'title',
        'message',
        'action_url',
        'is_read',
        'read_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user that owns the notification
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related user (if any)
     */
    public function relatedUser()
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    /**
     * Scope: Get unread notifications
     */
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    /**
     * Scope: Get notifications for a user
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope: Get recent notifications
     */
    public function scopeRecent($query, $limit = 50)
    {
        return $query->orderBy('created_at', 'desc')->limit($limit);
    }

    /**
     * Mark notification as read
     */
    public function markAsRead()
    {
        if (!$this->is_read) {
            $this->update([
                'is_read' => true,
                'read_at' => now(),
            ]);
        }

        return $this;
    }

    /**
     * Mark notification as unread
     */
    public function markAsUnread()
    {
        $this->update([
            'is_read' => false,
            'read_at' => null,
        ]);

        return $this;
    }

    /**
     * Get notification type label
     */
    public function getTypeLabel(): string
    {
        $labels = [
            'connection_request' => 'Connection Request',
            'connection_accepted' => 'Connection Accepted',
            'connection_declined' => 'Connection Declined',
            'connection_undone' => 'Connection Undone',
            'family_tree_invite' => 'Family Tree Invite',
            'family_tree_member_added' => 'Family Member Added',
            'status_changed' => 'Status Changed',
            'child_account_created' => 'Child Account Created',
            'profile_updated' => 'Profile Updated',
            'message' => 'Message',
        ];

        return $labels[$this->type] ?? 'Notification';
    }

    /**
     * Get notification type icon
     */
    public function getTypeIcon(): string
    {
        $icons = [
            'connection_request' => 'UserPlus',
            'connection_accepted' => 'CheckCircle',
            'connection_declined' => 'XCircle',
            'connection_undone' => 'RotateCcw',
            'family_tree_invite' => 'Share2',
            'family_tree_member_added' => 'Users',
            'status_changed' => 'AlertCircle',
            'child_account_created' => 'Baby',
            'profile_updated' => 'Edit',
            'message' => 'MessageCircle',
        ];

        return $icons[$this->type] ?? 'Bell';
    }

    /**
     * Get notification type color (for badge)
     */
    public function getTypeColor(): string
    {
        $colors = [
            'connection_request' => 'primary',
            'connection_accepted' => 'success',
            'connection_declined' => 'danger',
            'connection_undone' => 'warning',
            'family_tree_invite' => 'info',
            'family_tree_member_added' => 'success',
            'status_changed' => 'warning',
            'child_account_created' => 'info',
            'profile_updated' => 'info',
            'message' => 'primary',
        ];

        return $colors[$this->type] ?? 'secondary';
    }
}
