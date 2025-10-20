<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDemandeDevisRequest;
use App\Http\Requests\UpdateDemandeDevisRequest;
use App\Models\DemandeDevis;
use App\Models\User;
use App\Notifications\NewDemandeDevisNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Str;

class DemandeDevisController extends Controller
{
    // GET /api/demandes-devis?search=&status=&formation=
    public function index(Request $request)
    {
        $q = DemandeDevis::query();

        if ($s = trim((string) $request->get('search'))) {
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', "%{$s}%")
                    ->orWhere('email', 'like', "%{$s}%")
                    ->orWhere('phone', 'like', "%{$s}%")
                    ->orWhere('formation', 'like', "%{$s}%")
                    ->orWhere('notes', 'like', "%{$s}%")
                    ->orWhere('traitement_notes', 'like', "%{$s}%");
            });
        }

        if ($st = $request->get('status')) {
            $q->where('status', $st);
        }

        if ($f = trim((string) $request->get('formation'))) {
            $q->where('formation', 'like', "%{$f}%");
        }

        $q->orderByDesc('created_at');

        return response()->json($q->paginate(20));
    }

    // GET /api/demandes-devis/{demandeDevis}
    public function show(DemandeDevis $demandeDevis)
    {
        return response()->json(['data' => $demandeDevis]);
    }

    // POST /api/demandes-devis (site public)
    public function store(StoreDemandeDevisRequest $request)
    {
        $data = $request->validated();
        $data['status'] = 'En attente';

        $demande = DemandeDevis::create($data);

        // 1) Email vers NOTIFY_EMAIL (si défini)
        if ($email = env('NOTIFY_EMAIL')) {
            Notification::route('mail', $email)
                ->notify(new NewDemandeDevisNotification($demande));
        }

        // 2) Notification en base pour l'admin (sinon fallback "virtuel")
        if ($admin = User::query()->first()) {
            $admin->notify(new NewDemandeDevisNotification($demande));
        } else {
            $notification = new DatabaseNotification();
            $notification->id = Str::uuid()->toString();
            $notification->type = NewDemandeDevisNotification::class;
            $notification->notifiable_type = User::class; // "App\Models\User"
            $notification->notifiable_id = 0;            // virtuel
            $notification->data = [
                'kind'      => 'new_demande',
                'id'        => $demande->id,
                'name'      => $demande->name,
                'email'     => $demande->email,
                'phone'     => $demande->phone,
                'formation' => $demande->formation,
                'status'    => $demande->status,
            ];
            $notification->created_at = now();
            $notification->updated_at = now();
            $notification->save();
        }

        return response()->json(['data' => $demande], 201);
    }

    // PATCH /api/demandes-devis/{demandeDevis}
    public function update(UpdateDemandeDevisRequest $request, DemandeDevis $demandeDevis)
    {
        $data = $request->validated();

        $demandeDevis->fill($data);

        if (array_key_exists('status', $data)) {
            if ($data['status'] === 'Traité' && !$demandeDevis->processed_at) {
                $demandeDevis->processed_at = now();
                $demandeDevis->processed_by = optional($request->user())->name ?? 'backoffice';
            }

            if ($data['status'] === 'En attente') {
                $demandeDevis->processed_at = null;
                $demandeDevis->processed_by = null;
            }
        }

        $demandeDevis->save();

        return response()->json(['data' => $demandeDevis]);
    }

    // DELETE /api/demandes-devis/{demandeDevis}
public function destroy(DemandeDevis $demandeDevis)
{
    $demandeDevis->deleted_by = auth()->user()->name ?? 'Système';
    $demandeDevis->save();

    $demandeDevis->delete(); // 👈 soft delete
    return response()->noContent();
}

}
