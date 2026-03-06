<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $fullName,
        public string $username,
        public string $verificationCode,
        public string $socialMediaUrl
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your FamTree Username Verification Code',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.verification-code',
            with: [
                'fullName' => $this->fullName,
                'username' => $this->username,
                'verificationCode' => $this->verificationCode,
                'socialMediaUrl' => $this->socialMediaUrl,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
