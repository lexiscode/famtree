<?php

namespace App\Models\GuestModels;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            if (empty($user->uuid)) {
                $user->uuid = (string) Str::uuid();
            }
        });
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'uuid',
        'first_name',
        'last_name',
        'username',
        'email',
        'password',
        'phone',
        'address',
        'bio',
        'date_of_birth',
        'gender',
        'profile_image',
        'profile_image_url',
        'status',
        'account_status',
        'death_date',
        'parent_user_id',
        'is_child_account',
        'created_by_user_id',
        'onboarding_completed',
        'two_fa_enabled',
        'two_fa_secret',
        'two_fa_backup_codes',
        'profile_visibility',
        'blur_nuclear_family_for_public',
        'stories_visibility',
        'galleries_visibility',
        'scheduled_deletion_at',
        'google_id',
        'oauth_provider',
        'oauth_linked_at',
        'last_active_at',
        'is_memorial',
        'memorialized_at',
        'memorialized_by',
        'reactivation_token',
        'reactivation_token_expires_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_fa_secret',
        'two_fa_backup_codes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'date_of_birth' => 'date',
        'death_date' => 'date',
        'is_child_account' => 'boolean',
        'onboarding_completed' => 'boolean',
        'two_fa_enabled' => 'boolean',
        'blur_nuclear_family_for_public' => 'boolean',
        'oauth_linked_at' => 'datetime',
        'last_active_at' => 'datetime',
        'is_memorial' => 'boolean',
        'memorialized_at' => 'datetime',
        'reactivation_token_expires_at' => 'datetime',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_image_url',
    ];

    /**
     * Relationships
     */

    /**
     * Get the parent user (if this is a child account)
     */
    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_user_id');
    }

    /**
     * Get child accounts created by this user
     */
    public function children()
    {
        return $this->hasMany(User::class, 'parent_user_id');
    }

    /**
     * Get the user who created this account
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by_user_id');
    }

    /**
     * Get onboarding steps for this user
     */
    public function onboardingSteps()
    {
        return $this->hasMany(OnboardingStep::class);
    }

    /**
     * Get family info for this user
     */
    public function familyInfo()
    {
        return $this->hasOne(UserFamilyInfo::class);
    }

    /**
     * Get gallery items for this user
     */
    public function galleries()
    {
        return $this->hasMany(Gallery::class);
    }

    /**
     * Get user connections (where user is requester)
     */
    public function userConnections()
    {
        return $this->hasMany(UserConnection::class, 'requester_user_id');
    }

    /**
     * Get all connections (requester and recipient)
     */
    public function allConnections()
    {
        return UserConnection::where('requester_user_id', $this->id)
            ->orWhere('recipient_user_id', $this->id);
    }

    /**
     * Get the full URL for the profile image
     */
    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image) {
            return Storage::disk('public')->url($this->profile_image);
        }
        return null;
    }

    /**
     * Get the active deceased verification for this user
     */
    public function deceasedVerification()
    {
        return $this->hasOne(DeceasedVerification::class)->pending();
    }

    /**
     * Get all deceased verifications for this user
     */
    public function deceasedVerifications()
    {
        return $this->hasMany(DeceasedVerification::class);
    }

    /**
     * Get memorial messages for this user (if memorialized)
     */
    public function memorialMessages()
    {
        return $this->hasMany(MemorialMessage::class);
    }

    /**
     * Get the user who memorialized this account
     */
    public function memorializedByUser()
    {
        return $this->belongsTo(User::class, 'memorialized_by');
    }

    /**
     * Scope: users inactive for X months
     */
    public function scopeInactive($query, int $months)
    {
        return $query->where(function ($q) use ($months) {
            $q->where('last_active_at', '<=', now()->subMonths($months))
              ->orWhereNull('last_active_at');
        });
    }

    /**
     * Scope: memorialized users
     */
    public function scopeMemorialized($query)
    {
        return $query->where('is_memorial', true);
    }

    /**
     * Scope: active (non-memorialized) users
     */
    public function scopeActive($query)
    {
        return $query->where('is_memorial', false);
    }

    /**
     * Check if user is memorialized
     */
    public function isMemorialized(): bool
    {
        return $this->is_memorial === true;
    }

    /**
     * Check if user has a pending deceased verification
     */
    public function hasPendingVerification(): bool
    {
        return DeceasedVerification::forUser($this->id)->pending()->exists();
    }

    /**
     * Get the pending deceased verification
     */
    public function getPendingVerification(): ?DeceasedVerification
    {
        return DeceasedVerification::forUser($this->id)->pending()->first();
    }
}
