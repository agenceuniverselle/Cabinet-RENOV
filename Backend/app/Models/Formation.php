<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Formation extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'category',
        'certification',
        'participants',
        'level',
        'description',
        'objectives',
        'icon_key',
        'language',
        'popular',
        'deleted_by',
    ];

    protected $casts = [
        'objectives' => 'array',
    ];

    protected $dates = ['deleted_at'];
}
