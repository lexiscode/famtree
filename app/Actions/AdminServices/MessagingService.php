<?php

namespace App\Actions\AdminServices;

use App\Repositories\AdminRepositories\MessagingRepository;
use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class MessagingService
{
    public function __construct(private MessagingRepository $repository)
    {
    }

    /**
     * Get conversations with pagination and formatting
     */
    public function getConversations(array $filters = [], int $perPage = 15, int $page = 1)
    {
        return $this->repository->getConversationsPaginated($perPage, $page, $filters)->through(function ($conversation) {
            return $this->formatConversationForList($conversation);
        });
    }

    /**
     * Get conversation detail with messages
     */
    public function getConversationDetail(int $id, int $perPage = 50, int $page = 1): ?array
    {
        $conversation = $this->repository->findConversation($id);

        if (!$conversation) {
            return null;
        }

        $messages = $this->repository->getConversationMessages($id, $perPage, $page)->through(function ($message) {
            return $this->formatPrivateMessage($message);
        });

        return [
            'conversation' => [
                'id' => $conversation->id,
                'uuid' => $conversation->uuid,
                'messages_count' => $conversation->messages_count,
                'last_message_at' => $conversation->last_message_at?->format('Y-m-d H:i:s'),
                'last_message_at_formatted' => $conversation->last_message_at?->diffForHumans() ?? 'N/A',
                'user_one' => $conversation->userOne ? [
                    'id' => $conversation->userOne->id,
                    'first_name' => $conversation->userOne->first_name,
                    'last_name' => $conversation->userOne->last_name,
                    'full_name' => "{$conversation->userOne->first_name} {$conversation->userOne->last_name}",
                    'username' => $conversation->userOne->username,
                    'email' => $conversation->userOne->email,
                    'profile_image_url' => $conversation->userOne->profile_image_url,
                ] : null,
                'user_two' => $conversation->userTwo ? [
                    'id' => $conversation->userTwo->id,
                    'first_name' => $conversation->userTwo->first_name,
                    'last_name' => $conversation->userTwo->last_name,
                    'full_name' => "{$conversation->userTwo->first_name} {$conversation->userTwo->last_name}",
                    'username' => $conversation->userTwo->username,
                    'email' => $conversation->userTwo->email,
                    'profile_image_url' => $conversation->userTwo->profile_image_url,
                ] : null,
                'created_at' => $conversation->created_at->format('Y-m-d H:i:s'),
            ],
            'messages' => $messages,
        ];
    }

    /**
     * Remove a private message
     */
    public function removeMessage(int $messageId): bool
    {
        try {
            $success = $this->repository->deleteMessage($messageId);

            if ($success) {
                $this->logActivity('delete_private_message', 'PrivateMessage', $messageId, "Deleted private message #{$messageId}");
            }

            return $success;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get tree chats with pagination and formatting
     */
    public function getTreeChats(array $filters = [], int $perPage = 15, int $page = 1)
    {
        return $this->repository->getTreeChatsPaginated($perPage, $page, $filters)->through(function ($tree) {
            return $this->formatTreeChatForList($tree);
        });
    }

    /**
     * Get tree chat detail with messages
     */
    public function getTreeChatDetail(int $familyTreeId, int $perPage = 50, int $page = 1): ?array
    {
        $tree = \App\Models\GuestModels\FamilyTree::with('rootUser:id,first_name,last_name,username,profile_image')
            ->withCount('members')
            ->find($familyTreeId);

        if (!$tree) {
            return null;
        }

        $messages = $this->repository->getTreeChatMessages($familyTreeId, $perPage, $page)->through(function ($message) {
            return $this->formatTreeChatMessage($message);
        });

        return [
            'tree' => [
                'id' => $tree->id,
                'uuid' => $tree->uuid,
                'tree_name' => $tree->tree_name,
                'is_public' => $tree->is_public,
                'members_count' => $tree->members_count,
                'root_user' => $tree->rootUser ? [
                    'id' => $tree->rootUser->id,
                    'first_name' => $tree->rootUser->first_name,
                    'last_name' => $tree->rootUser->last_name,
                    'full_name' => "{$tree->rootUser->first_name} {$tree->rootUser->last_name}",
                    'username' => $tree->rootUser->username,
                    'profile_image_url' => $tree->rootUser->profile_image_url,
                ] : null,
            ],
            'messages' => $messages,
        ];
    }

    /**
     * Remove a tree chat message
     */
    public function removeTreeMessage(int $messageId): bool
    {
        try {
            $success = $this->repository->deleteTreeMessage($messageId);

            if ($success) {
                $this->logActivity('delete_tree_message', 'TreeChatMessage', $messageId, "Deleted tree chat message #{$messageId}");
            }

            return $success;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get class set chats with pagination and formatting
     */
    public function getClassSetChats(array $filters = [], int $perPage = 15, int $page = 1)
    {
        return $this->repository->getClassSetChatsPaginated($perPage, $page, $filters)->through(function ($classSet) {
            return $this->formatClassSetChatForList($classSet);
        });
    }

    /**
     * Get class set chat detail with messages
     */
    public function getClassSetChatDetail(int $classSetId, int $perPage = 50, int $page = 1): ?array
    {
        $classSet = \App\Models\GuestModels\ClassSet::with('department:id,name')
            ->withCount(['members', 'messages'])
            ->find($classSetId);

        if (!$classSet) {
            return null;
        }

        $messages = $this->repository->getClassSetMessages($classSetId, $perPage, $page)->through(function ($message) {
            return $this->formatClassSetMessage($message);
        });

        return [
            'classSet' => [
                'id' => $classSet->id,
                'uuid' => $classSet->uuid,
                'name' => $classSet->name,
                'year' => $classSet->year,
                'is_active' => $classSet->is_active,
                'members_count' => $classSet->members_count,
                'messages_count' => $classSet->messages_count,
                'department' => $classSet->department ? [
                    'id' => $classSet->department->id,
                    'name' => $classSet->department->name,
                ] : null,
            ],
            'messages' => $messages,
        ];
    }

    /**
     * Remove a class set message
     */
    public function removeClassSetMessage(int $messageId): bool
    {
        try {
            $success = $this->repository->deleteClassSetMessage($messageId);

            if ($success) {
                $this->logActivity('delete_class_set_message', 'ClassSetMessage', $messageId, "Deleted class set message #{$messageId}");
            }

            return $success;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get messaging statistics
     */
    public function getStats(): array
    {
        return [
            'total_conversations' => $this->repository->countConversations(),
            'total_private_messages' => $this->repository->countPrivateMessages(),
            'total_tree_messages' => $this->repository->countTreeChatMessages(),
            'total_class_set_messages' => $this->repository->countClassSetMessages(),
        ];
    }

    /**
     * Format conversation for list view
     */
    private function formatConversationForList($conversation): array
    {
        return [
            'id' => $conversation->id,
            'uuid' => $conversation->uuid,
            'messages_count' => $conversation->messages_count,
            'last_message_at' => $conversation->last_message_at?->format('Y-m-d H:i:s'),
            'last_message_at_formatted' => $conversation->last_message_at?->diffForHumans() ?? 'N/A',
            'latest_message' => $conversation->latestMessage ? [
                'message' => \Illuminate\Support\Str::limit($conversation->latestMessage->message, 100),
                'created_at_formatted' => $conversation->latestMessage->created_at->diffForHumans(),
            ] : null,
            'user_one' => $conversation->userOne ? [
                'id' => $conversation->userOne->id,
                'first_name' => $conversation->userOne->first_name,
                'last_name' => $conversation->userOne->last_name,
                'full_name' => "{$conversation->userOne->first_name} {$conversation->userOne->last_name}",
                'username' => $conversation->userOne->username,
                'profile_image_url' => $conversation->userOne->profile_image_url,
            ] : null,
            'user_two' => $conversation->userTwo ? [
                'id' => $conversation->userTwo->id,
                'first_name' => $conversation->userTwo->first_name,
                'last_name' => $conversation->userTwo->last_name,
                'full_name' => "{$conversation->userTwo->first_name} {$conversation->userTwo->last_name}",
                'username' => $conversation->userTwo->username,
                'profile_image_url' => $conversation->userTwo->profile_image_url,
            ] : null,
            'created_at' => $conversation->created_at->format('Y-m-d'),
            'created_at_formatted' => $conversation->created_at->diffForHumans(),
        ];
    }

    /**
     * Format private message
     */
    private function formatPrivateMessage($message): array
    {
        return [
            'id' => $message->id,
            'message' => $message->message,
            'is_delivered' => $message->is_delivered,
            'is_read' => $message->is_read,
            'is_edited' => $message->is_edited,
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'first_name' => $message->sender->first_name,
                'last_name' => $message->sender->last_name,
                'full_name' => "{$message->sender->first_name} {$message->sender->last_name}",
                'username' => $message->sender->username,
                'profile_image_url' => $message->sender->profile_image_url,
            ] : null,
            'created_at' => $message->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $message->created_at->diffForHumans(),
        ];
    }

    /**
     * Format tree chat for list view
     */
    private function formatTreeChatForList($tree): array
    {
        return [
            'id' => $tree->id,
            'uuid' => $tree->uuid,
            'tree_name' => $tree->tree_name,
            'is_public' => $tree->is_public,
            'members_count' => $tree->members_count,
            'root_user' => $tree->rootUser ? [
                'id' => $tree->rootUser->id,
                'first_name' => $tree->rootUser->first_name,
                'last_name' => $tree->rootUser->last_name,
                'full_name' => "{$tree->rootUser->first_name} {$tree->rootUser->last_name}",
                'username' => $tree->rootUser->username,
                'profile_image_url' => $tree->rootUser->profile_image_url,
            ] : null,
            'created_at' => $tree->created_at->format('Y-m-d'),
            'created_at_formatted' => $tree->created_at->diffForHumans(),
        ];
    }

    /**
     * Format tree chat message
     */
    private function formatTreeChatMessage($message): array
    {
        return [
            'id' => $message->id,
            'message' => $message->message,
            'is_read' => $message->is_read,
            'is_edited' => $message->is_edited,
            'user' => $message->user ? [
                'id' => $message->user->id,
                'first_name' => $message->user->first_name,
                'last_name' => $message->user->last_name,
                'full_name' => "{$message->user->first_name} {$message->user->last_name}",
                'username' => $message->user->username,
                'profile_image_url' => $message->user->profile_image_url,
            ] : null,
            'created_at' => $message->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $message->created_at->diffForHumans(),
        ];
    }

    /**
     * Format class set chat for list view
     */
    private function formatClassSetChatForList($classSet): array
    {
        return [
            'id' => $classSet->id,
            'uuid' => $classSet->uuid,
            'name' => $classSet->name,
            'year' => $classSet->year,
            'is_active' => $classSet->is_active,
            'members_count' => $classSet->members_count,
            'messages_count' => $classSet->messages_count,
            'department' => $classSet->department ? [
                'id' => $classSet->department->id,
                'name' => $classSet->department->name,
            ] : null,
            'created_at' => $classSet->created_at->format('Y-m-d'),
            'created_at_formatted' => $classSet->created_at->diffForHumans(),
        ];
    }

    /**
     * Format class set message
     */
    private function formatClassSetMessage($message): array
    {
        return [
            'id' => $message->id,
            'message' => $message->message,
            'is_edited' => $message->is_edited,
            'is_org_broadcast' => $message->is_org_broadcast,
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'first_name' => $message->sender->first_name,
                'last_name' => $message->sender->last_name,
                'full_name' => "{$message->sender->first_name} {$message->sender->last_name}",
                'username' => $message->sender->username,
                'profile_image_url' => $message->sender->profile_image_url,
            ] : null,
            'created_at' => $message->created_at->format('Y-m-d H:i:s'),
            'created_at_formatted' => $message->created_at->diffForHumans(),
        ];
    }

    /**
     * Log admin activity
     */
    private function logActivity(string $actionType, string $resourceType, int $resourceId, string $description): void
    {
        try {
            $admin = Auth::guard('admin')->user();
            $request = request();

            AdminActivityLog::create([
                'admin_id' => $admin?->id,
                'action_type' => $actionType,
                'resource_type' => $resourceType,
                'resource_id' => $resourceId,
                'description' => $description,
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        } catch (\Exception $e) {
            // Silently fail
        }
    }
}
