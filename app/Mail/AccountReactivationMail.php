<?php

namespace App\Mail;

use App\Models\GuestModels\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AccountReactivationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public string $token
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Verify Your Identity to Reactivate Your Account',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $expiryHours = config('memorial.reactivation_token_expiry', 24);

        return new Content(
            view: 'emails.account-reactivation',
            with: [
                'userName' => $this->user->first_name,
                'reactivationUrl' => route('account.reactivate', ['token' => $this->token]),
                'expiryHours' => $expiryHours,
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
