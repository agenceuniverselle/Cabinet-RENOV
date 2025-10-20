<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreContactMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // protège via rate limiting côté route si besoin
    }

    protected function prepareForValidation(): void
    {
        // Normalise le téléphone : supprime espaces et tirets
        $phone = preg_replace('/[\s\-]+/', '', (string) $this->input('phone'));

        $this->merge([
            'phone' => $phone,
        ]);
    }

    public function rules(): array
    {
        return [
            'name'    => ['required', 'string', 'max:120'],
            'email'   => ['required', 'email:rfc,dns', 'max:255'],
            'phone'   => [
                'required',
                'string',
                'max:30',
                // min 6 chiffres, max 15 chiffres, peut commencer par +, accepte 0/212/+212 etc.
                'regex:/^\+?\d{6,15}$/',
            ],
            'company' => ['nullable', 'string', 'max:150'],
            'subject' => ['nullable', 'string', 'max:180'],
            'message' => ['required', 'string', 'max:65535'],

            // Honeypot : on n’empêche pas, on marquera "is_spam" côté contrôleur
            'website' => ['nullable', 'string', 'max:200'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Le nom est obligatoire.',
            'email.required'   => "L'email est obligatoire.",
            'email.email'      => "L'email n'est pas valide.",
            'phone.required'   => 'Le téléphone est obligatoire.',
            'phone.regex'      => 'Le numéro de téléphone est invalide.',
            'message.required' => 'Le message est obligatoire.',
        ];
    }
}
