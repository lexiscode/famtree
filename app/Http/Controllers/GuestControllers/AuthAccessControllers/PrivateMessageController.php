<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Actions\GuestServices\AuthAccessServices\PrivateMessageService;
use App\Http\Controllers\Controller;
use App\Models\GuestModels\Conversation;
use App\Repositories\GuestRepositories\FamilyTreeRepository;
use App\Repositories\GuestRepositories\AuthAccessRepositories\TreeChatRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PrivateMessageController extends Controller
{
    public function __construct(
        private PrivateMessageService $messageService,
        private FamilyTreeRepository $familyTreeRepository,
        private TreeChatRepository $treeChatRepository
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
        ]);

        $result = $this->messageService->sendMessage(
            $conversation->id,
            $user->id,
            $validated['message']
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
            'is_delivered' => $message->is_delivered,
            'is_read' => $message->is_read,
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
        $trees = $this->familyTreeRepository->getUserMemberTrees($userId);

        return $trees->map(function ($tree) use ($userId) {
            $latestMessage = $this->treeChatRepository->getLatestMessage($tree->id);
            $unreadCount = $this->treeChatRepository->getUnreadCount($tree->id, $userId);
            $memberCount = $tree->members->count();

            // Use merged group name if set, otherwise use tree name
            $displayName = $tree->getMergedGroupDisplayName();

            return [
                'uuid' => $tree->uuid,
                'type' => 'group',
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
        })->toArray();
    }
}
