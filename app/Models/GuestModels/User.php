<?php

namespace App\Models\GuestModels;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
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
        'death_date',
        'parent_user_id',
        'is_child_account',
        'created_by_user_id',
        'onboarding_completed',
        'two_fa_enabled',
        'two_fa_secret',
        'two_fa_backup_codes',
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
     * Get the full URL for the profile image
     */
    public function getProfileImageUrlAttribute()
    {
        if ($this->profile_image) {
            return Storage::disk('public')->url($this->profile_image);
        }
        return null;
    }
}
