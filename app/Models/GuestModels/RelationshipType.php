<?php

namespace App\Models\GuestModels;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RelationshipType extends Model
{
    use HasFactory;

    protected $fillable = [
        'type_key',
        'label',
        'description',
        'sort_order',
        'is_bidirectional',
    ];
}
