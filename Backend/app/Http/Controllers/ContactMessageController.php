<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Notifications\NewContactMessageNotification;
use Illuminate\Support\Facades\Notification;
use App\Models\User;

class ContactMessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = ContactMessage::query()->orderByDesc('created_at');

        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }

        $messages = $query->paginate(25);

        return response()->json($messages);
    }

    public function show(ContactMessage $contactMessage): JsonResponse
    {
        return response()->json(['data' => $contactMessage]);
    }

    public function store(StoreContactMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $isSpam = !empty($validated['website']);

        $message = ContactMessage::create([
            'name'       => $validated['name'],
            'email'      => $validated['email'],
            'phone'      => $validated['phone'],
            'company'    => $validated['company'] ?? null,
            'subject'    => $validated['subject'] ?? null,
            'message'    => $validated['message'],
            'website'    => $validated['website'] ?? null,
            'is_spam'    => $isSpam,
            'status'     => $isSpam ? 'Archivé' : 'Nouveau',
            'ip_address' => $request->ip(),
            'user_agent' => (string) $request->userAgent(),
            'meta'       => ['referer' => $request->headers->get('referer')],
        ]);
// ✅ Notification auto pour l’admin
if ($admin = User::query()->first()) {
    $admin->notify(new NewContactMessageNotification($message));
} else {
    Notification::route('mail', env('NOTIFY_EMAIL'))
        ->notify(new NewContactMessageNotification($message));
}
        return response()->json([
            'message' => $isSpam
                ? "Message reçu (marqué comme spam)."
                : "Message reçu avec succès.",
            'data'    => $message,
        ], 201);
    }

    public function update(Request $request, ContactMessage $contactMessage): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'sometimes|string|in:Nouveau,Lu,Traité,Archivé',
            'internal_notes' => 'nullable|string',
        ]);

        $contactMessage->fill($validated);
        $contactMessage->processed_by = $request->user()?->name ?? 'Admin';
        $contactMessage->processed_at = now();
        $contactMessage->save();

        return response()->json([
            'message' => 'Message mis à jour avec succès.',
            'data' => $contactMessage,
        ]);
    }

  public function destroy(ContactMessage $contactMessage): JsonResponse
{
    $contactMessage->deleted_by = auth()->user()->name ?? 'Système';
    $contactMessage->save();

    $contactMessage->delete(); // ✅ soft delete
    return response()->json(['message' => 'Message déplacé dans la corbeille.']);
}

}
