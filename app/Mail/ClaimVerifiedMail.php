<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ClaimVerifiedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $username,
        public string $tempUsername
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your FamTree Username Claim Has Been Verified!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.claim-verified',
            with: [
                'fullName' => $this->fullName,
                'username' => $this->username,
                'tempUsername' => $this->tempUsername,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
