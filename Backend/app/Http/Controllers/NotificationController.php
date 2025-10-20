<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use App\Models\User;

class NotificationController extends Controller
{
    // Liste (dernières N)
    public function index(Request $request)
    {
        $limit = min((int) $request->get('limit', 15), 50);

        // Utilisateur courant si auth, sinon 1er user en base
        $user = $request->user() ?? User::query()->first();

        $query = $user
            ? $user->notifications()
            : DatabaseNotification::query();

        // Récupère et normalise (array data, dates en string)
        $items = $query
            ->latest('created_at')
            ->limit($limit)
            ->get()
            ->map(function (DatabaseNotification $n) {
                $raw = $n->data;
                // au cas où $raw soit une string JSON
                if (is_string($raw)) {
                    $decoded = json_decode($raw, true);
                    $raw = is_array($decoded) ? $decoded : [];
                }

                return [
                    'id'         => $n->id,
                    'type'       => $n->type,
                    'data'       => $raw ?? [],
                    'read_at'    => optional($n->read_at)?->toISOString(),
                    'created_at' => optional($n->created_at)?->toISOString(),
                ];
            });

        return response()->json(['data' => $items]);
    }

    // Compteur non lues
    public function unreadCount(Request $request)
    {
        $user = $request->user() ?? User::query()->first();

        $count = $user
            ? $user->unreadNotifications()->count()
            : DatabaseNotification::query()->whereNull('read_at')->count();

        return response()->json(['data' => ['count' => $count]]);
    }

    // Marquer lue
    public function markRead(Request $request, string $id)
    {
        $user = $request->user() ?? User::query()->first();

        // Priorité : notif rattachée au user ; sinon fallback global
        $n = $user
            ? $user->notifications()->whereKey($id)->first()
            : null;

        if (!$n) {
            $n = DatabaseNotification::findOrFail($id);
        }

        $n->markAsRead();

        return response()->json(['data' => [
            'id'         => $n->id,
            'read_at'    => optional($n->read_at)?->toISOString(),
            'created_at' => optional($n->created_at)?->toISOString(),
            'type'       => $n->type,
            'data'       => $n->data,
        ]]);
    }
}