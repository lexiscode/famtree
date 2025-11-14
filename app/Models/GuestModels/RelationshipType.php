<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelationshipType extends Model
{
    use HasFactory;

    protected $table = 'relationship_types';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'type_key',
        'label',
        'reverse_type_key',
        'description',
        'sort_order',
    ];

    /**
     * Get the reverse relationship type (if it exists)
     */
    public function reverseType()
    {
        if (!$this->reverse_type_key) {
            return null;
        }

        return self::where('type_key', $this->reverse_type_key)->first();
    }
}
