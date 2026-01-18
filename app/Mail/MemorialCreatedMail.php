<?php

namespace App\Mail;

use App\Models\GuestModels\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class MemorialCreatedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $familyMember,
        public User $deceased
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $name = $this->deceased->first_name . ' ' . $this->deceased->last_name;
        return new Envelope(
            subject: "A memorial has been created for {$name}",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.memorial-created',
            with: [
                'familyMemberName' => $this->familyMember->first_name,
                'deceasedName' => $this->deceased->first_name . ' ' . $this->deceased->last_name,
                'memorialUrl' => url('/profile/' . $this->deceased->uuid),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
