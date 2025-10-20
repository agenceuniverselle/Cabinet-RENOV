<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDemandeDevisRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            // Statut : exigé si envoyé (tu peux mettre 'required' si tu veux le forcer à chaque update)
            'status'            => ['sometimes', 'required', Rule::in(['En attente','Traité','Archivé'])],

            // Notes internes du traitement (facultatif)
            'traitement_notes'  => ['sometimes', 'nullable', 'string', 'max:10000'],

            // 🔹 Champs éditables depuis le modal "Modifier…"
            'name'              => ['sometimes', 'string', 'min:2', 'max:255'],
            'email'             => ['sometimes', 'email', 'max:255'],
            'phone'             => ['sometimes', 'nullable', 'string', 'max:50'],
            'formation'         => ['sometimes', 'string', 'min:2', 'max:255'],
            'notes'             => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
