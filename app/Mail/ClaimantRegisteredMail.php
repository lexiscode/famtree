<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaimantRegisteredMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $claimantName,
        public string $tempUsername,
        public string $reservedUsername,
        public string $claimantEmail
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Action Required: Claimant Registered - Reassign Username',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.claimant-registered',
            with: [
                'claimantName' => $this->claimantName,
                'tempUsername' => $this->tempUsername,
                'reservedUsername' => $this->reservedUsername,
                'claimantEmail' => $this->claimantEmail,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
