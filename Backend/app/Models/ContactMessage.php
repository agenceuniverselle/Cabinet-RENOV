<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactMessage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'company',
        'subject',
        'message',
        'website',
        'is_spam',
        'ip_address',
        'user_agent',
        'meta',
        'status',
        'deleted_by',
    ];

    protected $casts = [
        'is_spam' => 'boolean',
        'meta' => 'array',
    ];

    protected $dates = ['deleted_at'];
}
