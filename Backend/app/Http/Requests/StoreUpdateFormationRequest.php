<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUpdateFormationRequest extends FormRequest
{
    // 🔑 Liste unique de toutes les icônes utilisées dans tes seeds + celles du front
    private const ALLOWED_ICONS = [
        // Celles du front (déjà supportées)
        'BarChart3','GraduationCap','Users','TrendingUp',

        // Celles de ton gros tableau
        'Briefcase','ClipboardList','UserCog','Workflow','Target','RefreshCw','Building2','Users2',
        'FileText','Scale','FileSearch','BookOpen','ClipboardCheck','Sparkles','Brain','UserSquare2',
        'UsersRound','Handshake','HeartHandshake','Languages','Laptop','Kanban','Megaphone','Mic',
        'AlertTriangle','BadgeCheck','Timer','Lightbulb','Flame','Globe','Share2','Rocket','MessageSquare',
        'ListOrdered','Presentation','Globe2','Leaf','Medal','ShieldPlus','Bolt','Utensils','FileBadge2',
        'CheckCheck','LineChart','CalendarRange','Cog','Activity','Wrench','Hammer','Microscope',
        'FlaskConical','Files','Sigma','Ruler','ShieldAlert',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'         => ['required', 'string', 'min:3'],
            'category'      => ['required', 'string', 'min:2'],
            'certification' => ['required', 'string', 'in:Certifiante,Non certifiante'],

            'participants'  => ['nullable', 'string', 'regex:/^\d+\-\d+$/'],
            'description'   => ['required', 'string', 'min:20'],

            'objectives'    => ['required', 'array', 'min:1'],
            'objectives.*'  => ['required', 'string', 'min:5'],

            // ✅ on valide désormais contre la liste complète
            'icon_key'      => ['required', 'string', Rule::in(self::ALLOWED_ICONS)],
            'language'      => ['required', 'string', 'in:Français,Arabe,Anglais'],

            // (optionnel) si tu l’utilises en DB
            'popular'       => ['sometimes', 'boolean'],
            'level'         => ['nullable', 'string', 'in:Débutant,Intermédiaire,Avancé'],
        ];
    }

    public function messages(): array
    {
        return [
            'title.required'     => 'Le titre est obligatoire.',
            'category.required'  => 'La catégorie est obligatoire.',
            'certification.in'   => 'Certification invalide.',
            'participants.regex' => 'Participants doit être du type 8-15.',
            'description.min'    => 'La description doit contenir au moins 20 caractères.',
            'objectives.required'=> 'Ajoutez au moins un objectif.',
            'objectives.array'   => 'Les objectifs doivent être une liste.',
            'objectives.*.min'   => 'Chaque objectif doit contenir au moins 5 caractères.',
            'icon_key.in'        => 'Icône invalide.',
            'language.in'        => 'Langue invalide.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $input = $this->all();

        // Normaliser "8 - 15" -> "8-15"
        if (isset($input['participants']) && is_string($input['participants'])) {
            $input['participants'] = preg_replace('/\s+/', '', $input['participants']);
        }

        // Boolean populaire
        if (isset($input['popular'])) {
            $input['popular'] = filter_var($input['popular'], FILTER_VALIDATE_BOOL, FILTER_NULL_ON_FAILURE) ?? false;
        }

        // Décoder objectives si string JSON
        if (isset($input['objectives']) && is_string($input['objectives'])) {
            $decoded = json_decode($input['objectives'], true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $input['objectives'] = $decoded;
            }
        }

        // 🔁 Accepter iconKey (camelCase) depuis le front et le basculer vers icon_key
        if (isset($input['iconKey']) && !isset($input['icon_key'])) {
            $input['icon_key'] = $input['iconKey'];
        }
        unset($input['iconKey']);

        $this->replace($input);
    }
}
