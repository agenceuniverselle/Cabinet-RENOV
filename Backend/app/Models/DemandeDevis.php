<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DemandeDevis extends Model
{
    use SoftDeletes;

    protected $table = 'demandes_devis';

    protected $fillable = [
        'formation',
        'name',
        'email',
        'phone',
        'notes',
        'status',
        'processed_at',
        'processed_by',
        'traitement_notes',
        'deleted_by',
    ];

    protected $casts = [
        'processed_at' => 'datetime',
    ];

    protected $dates = ['deleted_at'];
}
