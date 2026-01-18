<?php

namespace App\Mail;

use App\Models\GuestModels\DeceasedVerification;
use App\Models\GuestModels\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class FamilyStatusCheckMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $familyMember,
        public User $inactiveUser,
        public DeceasedVerification $verification
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $name = $this->inactiveUser->first_name . ' ' . $this->inactiveUser->last_name;
        return new Envelope(
            subject: "Is {$name} doing okay?",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.family-status-check',
            with: [
                'familyMemberName' => $this->familyMember->first_name,
                'inactiveUserName' => $this->inactiveUser->first_name . ' ' . $this->inactiveUser->last_name,
                'responseUrl' => route('status-check.show', ['verificationUuid' => $this->verification->uuid]),
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
