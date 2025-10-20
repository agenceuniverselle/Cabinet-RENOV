<?php

namespace App\Notifications;

use App\Models\DemandeDevis;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewDemandeDevisNotification extends Notification
{
    use Queueable;

    public function __construct(public DemandeDevis $demande) {}

    public function via(object $notifiable): array
    {
        // DB + Mail
        return ['database', 'mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.front_url', env('FRONT_URL', 'http://localhost:5173')), '/')
             . '/dashboard/students';

        return (new MailMessage)
            ->subject('Nouvelle demande de devis #' . $this->demande->id)
            ->greeting('Bonjour')
            ->line('Une nouvelle demande de devis a été reçue.')
            ->line('Formation : ' . $this->demande->formation)
            ->line('Client : ' . $this->demande->name . ' (' . $this->demande->email . ')')
            ->action('Ouvrir le tableau de bord', $url)
            ->line('ID demande : #' . $this->demande->id);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'kind'      => 'new_demande',
            'id'        => $this->demande->id,
            'name'      => $this->demande->name,
            'email'     => $this->demande->email,
            'phone'     => $this->demande->phone,
            'formation' => $this->demande->formation,
            'status'    => $this->demande->status,
        ];
    }
}
