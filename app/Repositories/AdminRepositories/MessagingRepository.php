<?php

namespace App\Repositories\AdminRepositories;

use App\Models\GuestModels\Conversation;
use App\Models\GuestModels\PrivateMessage;
use App\Models\GuestModels\TreeChatMessage;
use App\Models\GuestModels\FamilyTree;
use App\Models\GuestModels\ClassSet;
use App\Models\GuestModels\ClassSetMessage;
use Illuminate\Pagination\LengthAwarePaginator;

class MessagingRepository
{
    /**
     * Get conversations with pagination
     */
    public function getConversationsPaginated(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = Conversation::with([
            'userOne:id,first_name,last_name,username,email,profile_image',
            'userTwo:id,first_name,last_name,username,email,profile_image',
            'latestMessage',
        ])
        ->withCount('messages');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('userOne', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                })
                ->orWhereHas('userTwo', function ($uq) use ($search) {
                    $uq->where('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%");
                });
            });
        }

        $sortBy = $filters['sortBy'] ?? 'last_message_at';
        $sortOrder = $filters['sortOrder'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Find a conversation by ID
     */
    public function findConversation(int $id): ?Conversation
    {
        return Conversation::with([
            'userOne:id,first_name,last_name,username,email,profile_image',
            'userTwo:id,first_name,last_name,username,email,profile_image',
        ])
        ->withCount('messages')
        ->find($id);
    }

    /**
     * Get messages for a conversation with pagination
     */
    public function getConversationMessages(int $conversationId, int $perPage = 50, int $page = 1): LengthAwarePaginator
    {
        return PrivateMessage::with('sender:id,first_name,last_name,username,profile_image')
            ->where('conversation_id', $conversationId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Delete a private message
     */
    public function deleteMessage(int $messageId): bool
    {
        $message = PrivateMessage::find($messageId);
        return $message ? $message->delete() : false;
    }

    /**
     * Get tree chats with pagination (family trees that have chat messages)
     */
    public function getTreeChatsPaginated(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $treeIdsWithMessages = TreeChatMessage::select('family_tree_id')->distinct()->pluck('family_tree_id');

        $query = FamilyTree::with('rootUser:id,first_name,last_name,username,profile_image')
            ->withCount('members')
            ->whereIn('id', $treeIdsWithMessages);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('tree_name', 'like', "%{$search}%")
                    ->orWhereHas('rootUser', function ($uq) use ($search) {
                        $uq->where('first_name', 'like', "%{$search}%")
                            ->orWhere('last_name', 'like', "%{$search}%")
                            ->orWhere('username', 'like', "%{$search}%");
                    });
            });
        }

        $query->orderBy('updated_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get tree chat messages with pagination
     */
    public function getTreeChatMessages(int $familyTreeId, int $perPage = 50, int $page = 1): LengthAwarePaginator
    {
        return TreeChatMessage::with('user:id,first_name,last_name,username,profile_image')
            ->where('family_tree_id', $familyTreeId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Delete a tree chat message
     */
    public function deleteTreeMessage(int $messageId): bool
    {
        $message = TreeChatMessage::find($messageId);
        return $message ? $message->delete() : false;
    }

    /**
     * Get class set chats with pagination
     */
    public function getClassSetChatsPaginated(int $perPage = 15, int $page = 1, array $filters = []): LengthAwarePaginator
    {
        $query = ClassSet::with('department:id,name')
            ->withCount(['members', 'messages']);

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhereHas('department', function ($dq) use ($search) {
                        $dq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $query->orderBy('updated_at', 'desc');

        return $query->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Get class set messages with pagination
     */
    public function getClassSetMessages(int $classSetId, int $perPage = 50, int $page = 1): LengthAwarePaginator
    {
        return ClassSetMessage::with('sender:id,first_name,last_name,username,profile_image')
            ->where('class_set_id', $classSetId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);
    }

    /**
     * Delete a class set message
     */
    public function deleteClassSetMessage(int $messageId): bool
    {
        $message = ClassSetMessage::find($messageId);
        return $message ? $message->delete() : false;
    }

    /**
     * Count total conversations
     */
    public function countConversations(): int
    {
        return Conversation::count();
    }

    /**
     * Count total private messages
     */
    public function countPrivateMessages(): int
    {
        return PrivateMessage::count();
    }

    /**
     * Count total tree chat messages
     */
    public function countTreeChatMessages(): int
    {
        return TreeChatMessage::count();
    }

    /**
     * Count total class set messages
     */
    public function countClassSetMessages(): int
    {
        return ClassSetMessage::count();
    }
}
