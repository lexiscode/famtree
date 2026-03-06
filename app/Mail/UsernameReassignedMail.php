<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class UsernameReassignedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $newUsername,
        public string $oldUsername
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your FamTree Username Has Been Updated!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.username-reassigned',
            with: [
                'fullName' => $this->fullName,
                'newUsername' => $this->newUsername,
                'oldUsername' => $this->oldUsername,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
