<?php

namespace App\Repositories\GuestRepositories;

use App\Models\GuestModels\MemorialMessage;
use Illuminate\Database\Eloquent\Collection;

class MemorialMessageRepository
{
    /**
     * Create a new memorial message.
     */
    public function create(int $userId, int $authorId, string $relationshipType, string $message): MemorialMessage
    {
        return MemorialMessage::create([
            'user_id' => $userId,
            'author_id' => $authorId,
            'relationship_type' => $relationshipType,
            'message' => $message,
            'is_approved' => true,
        ]);
    }

    /**
     * Update a memorial message.
     */
    public function update(MemorialMessage $message, string $newContent): MemorialMessage
    {
        $message->update(['message' => $newContent]);
        return $message->fresh();
    }

    /**
     * Delete a memorial message.
     */
    public function delete(MemorialMessage $message): bool
    {
        return $message->delete();
    }

    /**
     * Find a memorial message by ID.
     */
    public function find(int $id): ?MemorialMessage
    {
        return MemorialMessage::find($id);
    }

    /**
     * Get all approved messages for a deceased user.
     */
    public function getMessagesForUser(int $userId): Collection
    {
        return MemorialMessage::forUser($userId)
            ->approved()
            ->with('author:id,uuid,first_name,last_name,profile_image')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Get messages by a specific author for a deceased user.
     */
    public function getMessagesByAuthor(int $userId, int $authorId): Collection
    {
        return MemorialMessage::forUser($userId)
            ->byAuthor($authorId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Check if an author has any messages for a deceased user.
     */
    public function hasAuthorWrittenMessage(int $userId, int $authorId): bool
    {
        return MemorialMessage::forUser($userId)
            ->byAuthor($authorId)
            ->exists();
    }

    /**
     * Get message count for a deceased user.
     */
    public function getMessageCount(int $userId): int
    {
        return MemorialMessage::forUser($userId)->approved()->count();
    }

    /**
     * Approve a message (for moderation).
     */
    public function approve(MemorialMessage $message): MemorialMessage
    {
        $message->update(['is_approved' => true]);
        return $message->fresh();
    }

    /**
     * Reject a message (for moderation).
     */
    public function reject(MemorialMessage $message): MemorialMessage
    {
        $message->update(['is_approved' => false]);
        return $message->fresh();
    }

    /**
     * Get all pending (unapproved) messages.
     */
    public function getPendingMessages(): Collection
    {
        return MemorialMessage::where('is_approved', false)
            ->with(['user:id,uuid,first_name,last_name', 'author:id,uuid,first_name,last_name'])
            ->orderBy('created_at', 'asc')
            ->get();
    }
}
