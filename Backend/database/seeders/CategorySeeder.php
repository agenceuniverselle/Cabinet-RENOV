<?php
// database/seeders/CategorySeeder.php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            "Management" => [
                "icon" => "Briefcase",
                "subs" => [
                    "Management & Leadership",
                    "Travail en Équipe & Management",
                    "Prise de Parole & Expression Orale",
                    "Communication Digitale & Réseautage",
                    "Communication & Soft Skills",
                ],
            ],
            "Ressources Humaines" => [
                "icon" => "Building2",
                "subs" => [
                    "Organisation & Gestion RH",
                    "Recrutement & Intégration",
                    "Performance & Compétences",
                    "Éthique & RSE",
                    "Digitalisation & Innovation RH",
                    "Législation & Réglementation",
                ],
            ],
            "Développement Personnel" => [
                "icon" => "Lightbulb",
                "subs" => [
                    "Développement Personnel & Soft Skills",
                    "Développement & Motivation",
                    "Bien-être & Santé au Travail",
                ],
            ],
            "Qualité & Normes" => [
                "icon" => "BadgeCheck",
                "subs" => [
                    "Qualité & Normes",
                    "Contrôle Qualité & Audit",
                    "Normes & Accréditation",
                    "Outils & Techniques d’Analyse",
                ],
            ],
            "Maintenance Industrielle" => [
                "icon" => "Wrench",
                "subs" => [
                    "Maintenance Industrielle",
                ],
            ],
            "Laboratoire" => [
                "icon" => "Microscope",
                "subs" => [
                    "Gestion des Risques en Laboratoire",
                    "Gestion des Risques & Conflits",
                ],
            ],
        ];

        foreach ($groups as $rootName => $cfg) {
            $root = Category::firstOrCreate(
                ['slug' => Str::slug($rootName)],
                ['name' => $rootName, 'icon_key' => $cfg['icon']]
            );

            foreach ($cfg['subs'] as $i => $sub) {
                Category::firstOrCreate(
                    ['slug' => Str::slug($rootName.'-'.$sub)],
                    [
                        'name' => $sub,
                        'parent_id' => $root->id,
                        'sort_order' => $i,
                    ]
                );
            }
        }
    }
}
