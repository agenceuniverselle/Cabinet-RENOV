<?php

namespace App\Http\Controllers;

use App\Models\Formation;
use App\Models\DemandeDevis;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class TrashController extends Controller
{
    public function index()
    {
        $models = [
            'formations'       => Formation::class,
            'demandes_devis'   => DemandeDevis::class,
            'contact_messages' => ContactMessage::class,
        ];

        $trash = collect();

        foreach ($models as $entity => $model) {
            $items = $model::onlyTrashed()->get()->map(function ($item) use ($entity) {
                return [
                    'id'         => $item->id,
                    'entity'     => $entity,
                    'title'      => $item->title ?? $item->name ?? $item->subject ?? '—',
                    'deleted_by' => $item->deleted_by ?? 'Système',
                    'created_at' => optional($item->deleted_at)->toDateTimeString(),
                ];
            });

            $trash = $trash->merge($items);
        }

        return response()->json(
            $trash->sortByDesc('created_at')->values()
        );
    }

    public function restore($entity, $id)
{
    $models = [
        'formations'       => Formation::class,
        'demandes_devis'   => DemandeDevis::class,
        'contact_messages' => ContactMessage::class,
    ];

    if (!isset($models[$entity])) {
        return response()->json(['message' => 'Type non reconnu.'], 400);
    }

    $model = $models[$entity];
    $record = $model::withTrashed()->find($id);

    if (!$record) {
        return response()->json(['message' => 'Élément introuvable.'], 404);
    }

    $record->restore();

    return response()->json(['message' => ucfirst(str_replace('_', ' ', $entity)) . ' restauré avec succès.']);
}


    public function destroy($id)
    {
        foreach ([Formation::class, DemandeDevis::class, ContactMessage::class] as $model) {
            $record = $model::withTrashed()->find($id);
            if ($record) {
                $record->forceDelete();
                return response()->json(['message' => 'Supprimé définitivement.']);
            }
        }
        return response()->json(['message' => 'Introuvable.'], 404);
    }

    public function emptyAll()
    {
        foreach ([Formation::class, DemandeDevis::class, ContactMessage::class] as $model) {
            $model::onlyTrashed()->forceDelete();
        }

        return response()->json(['message' => 'Corbeille vidée.']);
    }
}
