<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDemandeDevisRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'formation' => ['required','string','min:3'],
            'name'      => ['required','string','min:3'],
            'email'     => ['required','email'],
            'phone'     => ['nullable','string','min:6'],
            'notes'     => ['nullable','string','max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'formation.required' => 'La formation est obligatoire.',
            'name.required'      => 'Le nom complet est obligatoire.',
            'email.required'     => 'L’email est obligatoire.',
            'email.email'        => 'Le format de l’email est invalide.',
            'phone.regex'        => 'Le numéro de téléphone est invalide.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();

        // Accepte aussi "nom" et "telephone" en entrée (front FR) et normalise
        if (!isset($input['name']) && isset($input['nom'])) {
            $input['name'] = $input['nom'];
        }
        if (!isset($input['phone']) && isset($input['telephone'])) {
            $input['phone'] = $input['telephone'];
        }

        foreach (['formation','name','email','phone'] as $k) {
            if (isset($input[$k]) && is_string($input[$k])) {
                $input[$k] = trim($input[$k]);
            }
        }

        if (!empty($input['phone']) && is_string($input['phone'])) {
            $input['phone'] = preg_replace('/[^\d+()\s\-\.]/', '', $input['phone']);
        }

        if (isset($input['notes']) && is_string($input['notes'])) {
            $input['notes'] = trim(strip_tags($input['notes']));
        }

        $this->replace($input);
    }
}
