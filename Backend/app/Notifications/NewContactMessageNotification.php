<?php

namespace App\Notifications;

use App\Models\ContactMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewContactMessageNotification extends Notification
{
    use Queueable;

    public function __construct(public ContactMessage $message) {}

    public function via($notifiable)
    {
        return ['database']; // ou ['mail', 'database'] si tu veux aussi un email
    }

    public function toArray($notifiable)
    {
        return [
            'kind' => 'new_contact',
            'id' => $this->message->id,
            'name' => $this->message->name,
            'email' => $this->message->email,
            'phone' => $this->message->phone,
            'subject' => $this->message->subject,
            'message' => $this->message->message,
            'status' => $this->message->status,
        ];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('📬 Nouveau message de contact')
            ->greeting('Bonjour !')
            ->line('Vous avez reçu un nouveau message de contact.')
            ->line('Nom : ' . $this->message->name)
            ->line('Email : ' . $this->message->email)
            ->line('Message : ' . $this->message->message)
            ->action('Voir le message', url('/admin/messages'))
            ->line('Merci.');
    }
}
