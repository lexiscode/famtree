<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Actions\GuestServices\AuthAccessServices\PrivateMessageService;
use App\Actions\GuestServices\AuthAccessServices\ClassSetService;
use App\Http\Controllers\Controller;
use App\Models\GuestModels\Conversation;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\TreeChatRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetMessageRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\GlamRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\GlamSquadMessageRepository;
use App\Repositories\OrgRepositories\OrgGroupRepository;
use App\Repositories\OrgRepositories\OrgGroupMessageRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivateMessageController extends Controller
{
    public function __construct(
        private PrivateMessageService $messageService,
        private FamilyTreeRepository $familyTreeRepository,
        private TreeChatRepository $treeChatRepository,
        private ClassSetService $classSetService,
        private ClassSetRepository $classSetRepository,
        private ClassSetMessageRepository $classSetMessageRepository,
        private GlamRepository $glamRepository,
        private GlamSquadMessageRepository $glamSquadMessageRepository,
        private OrgGroupRepository $orgGroupRepository,
        private OrgGroupMessageRepository $orgGroupMessageRepository,
    ) {}

    /**
     * Display the messages page with conversation list
     */
    public function index()
    {
        $user = auth()->user();

        // Mark all undelivered messages as delivered when user comes online
        $this->messageService->markAllAsDelivered($user->id);

        $conversations = $this->messageService->getConversations($user->id);

        // Get family tree group chats
        $groupChats = $this->getGroupChats($user->id);

        // Calculate total unread (DM + group chats)
        $dmUnread = $this->messageService->getTotalUnreadCount($user->id);
        $groupChatUnread = array_sum(array_column($groupChats, 'unread_count'));
        $totalUnread = $dmUnread + $groupChatUnread;

        return Inertia::render('GuestPages/AuthAccessPages/Messages/Index', [
            'conversations' => $conversations->map(fn($c) => $this->formatConversation($c, $user->id)),
            'groupChats' => $groupChats,
            'activeConversation' => null,
            'totalUnread' => $totalUnread,
            'currentUserId' => $user->id,
        ]);
    }

    /**
     * Display a specific conversation
     */
    public function show(string $conversationUuid)
    {
        $user = auth()->user();
        $conversation = Conversation::where('uuid', $conversationUuid)->firstOrFail();

        // Verify user is part of conversation
        if (!$conversation->hasParticipant($user->id)) {
            abort(403, 'You are not part of this conversation.');
        }

        $conversations = $this->messageService->getConversations($user->id);
        $messages = $this->messageService->getMessages($conversation->id, $user->id);
        $otherUser = $conversation->getOtherUser($user->id);

        // Mark messages as read
        $this->messageService->markAsRead($conversation->id, $user->id);

        // Get family tree group chats
        $groupChats = $this->getGroupChats($user->id);

        // Calculate total unread (DM + group chats)
        $dmUnread = $this->messageService->getTotalUnreadCount($user->id);
        $groupChatUnread = array_sum(array_column($groupChats, 'unread_count'));
        $totalUnread = $dmUnread + $groupChatUnread;

        return Inertia::render('GuestPages/AuthAccessPages/Messages/Index', [
            'conversations' => $conversations->map(fn($c) => $this->formatConversation($c, $user->id)),
            'groupChats' => $groupChats,
            'activeConversation' => [
                'uuid' => $conversation->uuid,
                'otherUser' => [
                    'id' => $otherUser->id,
                    'uuid' => $otherUser->uuid,
                    'name' => trim($otherUser->first_name . ' ' . $otherUser->last_name),
                    'username' => $otherUser->username,
                    'profile_image_url' => $otherUser->profile_image_url,
                ],
                'messages' => $messages->map(fn($m) => $this->formatMessage($m)),
            ],
            'totalUnread' => $totalUnread,
            'currentUserId' => $user->id,
        ]);
    }

    /**
     * Start a new conversation (or redirect to existing)
     */
    public function startConversation(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'user_id' => 'required|integer|exists:users,id',
        ]);

        $result = $this->messageService->getOrCreateConversation($user->id, $validated['user_id']);

        if (!$result['success']) {
            return back()->with('error', $result['error']);
        }

        return redirect()->route('messages.show', $result['conversation']->uuid);
    }

    /**
     * API: Get messages for a conversation
     */
    public function getMessages(string $conversationUuid)
    {
        $user = auth()->user();
        $conversation = Conversation::where('uuid', $conversationUuid)->firstOrFail();

        if (!$conversation->hasParticipant($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $this->messageService->getMessages($conversation->id, $user->id);

        return response()->json([
            'messages' => $messages->map(fn($m) => $this->formatMessage($m)),
        ]);
    }

    /**
     * API: Send a message
     */
    public function sendMessage(Request $request, string $conversationUuid)
    {
        $user = auth()->user();
        $conversation = Conversation::where('uuid', $conversationUuid)->firstOrFail();

        if (!$conversation->hasParticipant($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:private_messages,id',
        ]);

        $result = $this->messageService->sendMessage(
            $conversation->id,
            $user->id,
            $validated['message'],
            $validated['reply_to_id'] ?? null
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'message' => $this->formatMessage($result['message']),
        ]);
    }

    /**
     * API: Mark messages as read
     */
    public function markAsRead(string $conversationUuid)
    {
        $user = auth()->user();
        $conversation = Conversation::where('uuid', $conversationUuid)->firstOrFail();

        if (!$conversation->hasParticipant($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $count = $this->messageService->markAsRead($conversation->id, $user->id);

        return response()->json([
            'success' => true,
            'marked_count' => $count,
        ]);
    }

    /**
     * API: Mark messages as delivered (called when user receives message via broadcast)
     */
    public function markAsDelivered(string $conversationUuid)
    {
        $user = auth()->user();
        $conversation = Conversation::where('uuid', $conversationUuid)->firstOrFail();

        if (!$conversation->hasParticipant($user->id)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $this->messageService->markConversationAsDelivered($conversation->id, $user->id);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * API: Mark all messages across all conversations as delivered
     * Called when user comes online (loads any authenticated page)
     */
    public function markAllAsDelivered()
    {
        $user = auth()->user();
        $this->messageService->markAllAsDelivered($user->id);

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * API: Typing indicator
     */
    public function typing(Request $request, string $conversationUuid)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $this->messageService->broadcastTyping($conversationUuid, $user, $validated['is_typing']);

        return response()->json(['success' => true]);
    }

    /**
     * API: Edit a message
     */
    public function editMessage(Request $request, int $messageId)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $result = $this->messageService->editMessage(
            $messageId,
            $user->id,
            $validated['message']
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'message' => $this->formatMessage($result['message']),
        ]);
    }

    /**
     * API: Delete a message
     */
    public function deleteMessage(int $messageId)
    {
        $user = auth()->user();

        $result = $this->messageService->deleteMessage($messageId, $user->id);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
        ]);
    }

    /**
     * API: Bulk delete messages
     */
    public function bulkDeleteMessages(Request $request)
    {
        $user = auth()->user();
        $validated = $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer',
        ]);

        $result = $this->messageService->bulkDeleteMessages(
            $validated['message_ids'],
            $user->id
        );

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $result['deleted_count'],
        ]);
    }

    /**
     * API: Get conversations list
     */
    public function getConversations()
    {
        $user = auth()->user();
        $conversations = $this->messageService->getConversations($user->id);

        return response()->json([
            'conversations' => $conversations->map(fn($c) => $this->formatConversation($c, $user->id)),
        ]);
    }

    /**
     * API: Get total unread count
     */
    public function getUnreadCount()
    {
        $user = auth()->user();

        // Calculate total unread (DM + group chats)
        $dmUnread = $this->messageService->getTotalUnreadCount($user->id);
        $groupChats = $this->getGroupChats($user->id);
        $groupChatUnread = array_sum(array_column($groupChats, 'unread_count'));

        return response()->json([
            'count' => $dmUnread + $groupChatUnread,
        ]);
    }

    /**
     * Helper: Format conversation for frontend
     */
    private function formatConversation($conversation, int $currentUserId): array
    {
        $otherUser = $conversation->getOtherUser($currentUserId);
        $latestMessage = $conversation->latestMessage;

        return [
            'uuid' => $conversation->uuid,
            'otherUser' => [
                'id' => $otherUser->id,
                'uuid' => $otherUser->uuid,
                'name' => trim($otherUser->first_name . ' ' . $otherUser->last_name),
                'username' => $otherUser->username ?? null,
                'profile_image_url' => $otherUser->profile_image_url,
            ],
            'lastMessage' => $latestMessage ? [
                'message' => $latestMessage->message,
                'sender_id' => $latestMessage->sender_id,
                'created_at' => $latestMessage->created_at->toISOString(),
                'is_read' => $latestMessage->is_read,
            ] : null,
            'last_message_at' => $conversation->last_message_at?->toISOString(),
            'unread_count' => $this->messageService->getUnreadCountForConversation(
                $conversation->id,
                $currentUserId
            ),
        ];
    }

    /**
     * Helper: Format message for frontend
     */
    private function formatMessage($message): array
    {
        return [
            'id' => $message->id,
            'conversation_id' => $message->conversation_id,
            'sender_id' => $message->sender_id,
            'message' => $message->message,
            'reply_to_id' => $message->reply_to_id,
            'replied_message' => $message->repliedMessage ? [
                'id' => $message->repliedMessage->id,
                'message' => $message->repliedMessage->message,
                'sender' => $message->repliedMessage->sender ? [
                    'id' => $message->repliedMessage->sender->id,
                    'first_name' => $message->repliedMessage->sender->first_name,
                    'last_name' => $message->repliedMessage->sender->last_name,
                ] : null,
            ] : null,
            'is_delivered' => $message->is_delivered,
            'is_read' => $message->is_read,
            'is_edited' => $message->is_edited,
            'edited_at' => $message->edited_at?->toISOString(),
            'created_at' => $message->created_at->toISOString(),
            'sender' => $message->sender ? [
                'id' => $message->sender->id,
                'first_name' => $message->sender->first_name,
                'last_name' => $message->sender->last_name,
                'profile_image_url' => $message->sender->profile_image_url,
            ] : null,
        ];
    }

    /**
     * Helper: Get family tree group chats for user
     */
    private function getGroupChats(int $userId): array
    {
        $groupChats = [];

        // Get family tree chats
        $trees = $this->familyTreeRepository->getUserMemberTrees($userId);
        foreach ($trees as $tree) {
            $latestMessage = $this->treeChatRepository->getLatestMessage($tree->id);
            $unreadCount = $this->treeChatRepository->getUnreadCount($tree->id, $userId);
            $memberCount = $tree->members->count();
            $displayName = $tree->getMergedGroupDisplayName();

            $groupChats[] = [
                'uuid' => $tree->uuid,
                'type' => 'family_tree',
                'name' => $displayName,
                'member_count' => $memberCount,
                'unread_count' => $unreadCount,
                'lastMessage' => $latestMessage ? [
                    'message' => $latestMessage->message,
                    'sender_id' => $latestMessage->user_id,
                    'sender_name' => $latestMessage->user ? trim($latestMessage->user->first_name . ' ' . $latestMessage->user->last_name) : 'Unknown',
                    'created_at' => $latestMessage->created_at->toISOString(),
                ] : null,
                'last_message_at' => $latestMessage ? $latestMessage->created_at->toISOString() : $tree->created_at->toISOString(),
            ];
        }

        // Get class set chats
        $classSets = $this->classSetRepository->getUserClassSets($userId);
        foreach ($classSets as $classSet) {
            $latestMessage = $this->classSetMessageRepository->getLatestMessage($classSet->id);
            $memberCount = $this->classSetRepository->getMemberCount($classSet->id);
            $unreadCount = $this->classSetMessageRepository->getUnreadCount($classSet->id, $userId);

            // Build display name with organization short name
            $orgName = $classSet->department->faculty->organization->short_name
                ?? $classSet->department->faculty->organization->name;
            $displayName = "{$classSet->name} - {$orgName}";

            $groupChats[] = [
                'uuid' => $classSet->uuid,
                'type' => 'class_set',
                'name' => $displayName,
                'member_count' => $memberCount,
                'unread_count' => $unreadCount,
                'lastMessage' => $latestMessage ? [
                    'message' => $latestMessage->message,
                    'sender_id' => $latestMessage->sender_id,
                    'sender_name' => $latestMessage->is_org_broadcast
                        ? ($latestMessage->organization->short_name ?? $latestMessage->organization->name ?? 'Organization')
                        : ($latestMessage->sender
                            ? trim($latestMessage->sender->first_name . ' ' . $latestMessage->sender->last_name)
                            : ($orgName ?? 'System')),
                    'created_at' => $latestMessage->created_at->toISOString(),
                ] : null,
                'last_message_at' => $latestMessage ? $latestMessage->created_at->toISOString() : $classSet->created_at->toISOString(),
            ];
        }

        // Get glam squad chats
        $glamSquads = $this->glamRepository->getUserSquads($userId);
        foreach ($glamSquads as $glamSquad) {
            $latestMessage = $this->glamSquadMessageRepository->getLatestMessage($glamSquad->id);
            $unreadCount = $this->glamSquadMessageRepository->getUnreadCount($glamSquad->id, $userId);

            $groupChats[] = [
                'id' => $glamSquad->id,
                'uuid' => $glamSquad->uuid,
                'type' => 'glam_squad',
                'name' => $glamSquad->name,
                'gender_track' => $glamSquad->gender_track,
                'member_count' => $glamSquad->members_count,
                'unread_count' => $unreadCount,
                'lastMessage' => $latestMessage ? [
                    'message' => $latestMessage->message,
                    'sender_id' => $latestMessage->sender_id,
                    'sender_name' => $latestMessage->sender
                        ? trim($latestMessage->sender->first_name . ' ' . $latestMessage->sender->last_name)
                        : 'Unknown',
                    'created_at' => $latestMessage->created_at->toISOString(),
                ] : null,
                'last_message_at' => $latestMessage ? $latestMessage->created_at->toISOString() : $glamSquad->created_at->toISOString(),
            ];
        }

        // Get org group chats
        $orgGroups = $this->orgGroupRepository->getUserOrgGroups($userId);
        foreach ($orgGroups as $orgGroup) {
            $latestMessage = $this->orgGroupMessageRepository->getLatestMessage($orgGroup->id);
            $memberCount = $orgGroup->activeMembers ? $orgGroup->activeMembers->count() : 0;

            $orgName = $orgGroup->organization->short_name ?? $orgGroup->organization->name ?? '';

            $groupChats[] = [
                'id' => $orgGroup->id,
                'uuid' => $orgGroup->uuid,
                'type' => 'org_group',
                'name' => $orgGroup->name,
                'organization_name' => $orgName,
                'member_count' => $memberCount,
                'unread_count' => 0,
                'is_suspended' => $orgGroup->is_suspended,
                'lastMessage' => $latestMessage ? [
                    'message' => $latestMessage->message,
                    'sender_id' => $latestMessage->user_id,
                    'sender_name' => $latestMessage->user
                        ? trim($latestMessage->user->first_name . ' ' . $latestMessage->user->last_name)
                        : 'Unknown',
                    'created_at' => $latestMessage->created_at->toISOString(),
                ] : null,
                'last_message_at' => $latestMessage ? $latestMessage->created_at->toISOString() : $orgGroup->created_at->toISOString(),
            ];
        }

        // Sort by last_message_at descending
        usort($groupChats, function ($a, $b) {
            return strtotime($b['last_message_at']) - strtotime($a['last_message_at']);
        });

        return $groupChats;
    }
}
