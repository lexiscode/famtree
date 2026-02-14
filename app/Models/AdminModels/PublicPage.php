<?php

namespace App\Models\AdminModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PublicPage extends Model
{
    use HasFactory;

    protected $table = 'public_pages';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'is_published',
        'created_by_admin_id',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'is_published' => 'boolean',
    ];

    /**
     * Boot the model to auto-generate slug from title.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($page) {
            if (empty($page->slug)) {
                $page->slug = Str::slug($page->title);

                // Ensure uniqueness
                $originalSlug = $page->slug;
                $counter = 1;
                while (static::where('slug', $page->slug)->exists()) {
                    $page->slug = "{$originalSlug}-{$counter}";
                    $counter++;
                }
            }
        });
    }

    /**
     * Relationship: Created by admin
     */
    public function createdBy()
    {
        return $this->belongsTo(Admin::class, 'created_by_admin_id');
    }

    /**
     * Scope: Published pages
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    /**
     * Scope: Draft pages
     */
    public function scopeDraft($query)
    {
        return $query->where('is_published', false);
    }
}
