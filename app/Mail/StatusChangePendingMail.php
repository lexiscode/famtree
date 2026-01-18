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

class StatusChangePendingMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     */
    public function __construct(
        public User $user,
        public DeceasedVerification $verification
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Important: Your FamTree Account Status',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $scheduledDate = $this->verification->status_change_scheduled_at;

        return new Content(
            view: 'emails.status-change-pending',
            with: [
                'userName' => $this->user->first_name,
                'scheduledDate' => $scheduledDate ? $scheduledDate->format('F j, Y') : 'soon',
                'daysRemaining' => $scheduledDate ? max(0, now()->diffInDays($scheduledDate, false)) : 0,
                'loginUrl' => url('/login'),
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
