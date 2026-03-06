<?php

namespace App\Models\AdminModels;

use Illuminate\Database\Eloquent\Model;

class UsernameClaimRequest extends Model
{
    protected $fillable = [
        'username',
        'full_name',
        'email',
        'social_media_url',
        'message',
        'verification_code',
        'status',
        'temp_username',
        'admin_notes',
    ];
}
