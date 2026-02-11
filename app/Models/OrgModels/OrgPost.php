<?php

namespace App\Models\OrgModels;

use App\Models\GuestModels\Organization;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class OrgPost extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'uuid',
        'organization_id',
        'org_account_id',
        'type',
        'content',
        'voice_url',
        'voice_duration',
        'views_count',
        'comments_count',
        'reactions_count',
        'is_pinned',
    ];

    protected $casts = [
        'is_pinned' => 'boolean',
        'views_count' => 'integer',
        'comments_count' => 'integer',
        'reactions_count' => 'integer',
        'voice_duration' => 'integer',
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

    public function images()
    {
        return $this->hasMany(OrgPostImage::class)->orderBy('order');
    }
}
