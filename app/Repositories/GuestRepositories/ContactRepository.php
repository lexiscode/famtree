<?php

namespace App\Repositories\GuestRepositories;

use App\Models\ContactSubmission;

class ContactRepository
{
    /**
     * Create a new contact submission
     */
    public function create(array $data): ContactSubmission
    {
        return ContactSubmission::create($data);
    }

    /**
     * Get all contact submissions (for admin)
     */
    public function all(): array
    {
        return ContactSubmission::orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Get unread submissions (for admin)
     */
    public function getUnread(): array
    {
        return ContactSubmission::where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Find submission by ID
     */
    public function find(int $id): ?ContactSubmission
    {
        return ContactSubmission::find($id);
    }

    /**
     * Mark submission as read
     */
    public function markAsRead(int $id): bool
    {
        $submission = $this->find($id);

        if (!$submission) {
            return false;
        }

        return $submission->update(['is_read' => true]);
    }

    /**
     * Mark submission as replied
     */
    public function markAsReplied(int $id): bool
    {
        $submission = $this->find($id);

        if (!$submission) {
            return false;
        }

        return $submission->update([
            'is_read' => true,
            'replied_at' => now(),
        ]);
    }

    /**
     * Delete a submission
     */
    public function delete(int $id): bool
    {
        $submission = $this->find($id);

        if (!$submission) {
            return false;
        }

        return $submission->delete();
    }
}
