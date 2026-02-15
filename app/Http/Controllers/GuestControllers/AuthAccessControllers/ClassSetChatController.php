<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\ClassSetChatService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ClassSetChatController extends Controller
{
    public function __construct(private ClassSetChatService $chatService)
    {
    }

    /**
     * Get messages for a class set chat
     */
    public function getMessages(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;
        $beforeId = $request->query('before_id');

        try {
            $result = $this->chatService->getMessages($classSetUuid, $userId, $beforeId);

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 403);
        }
    }

    /**
     * Send a message to a class set chat
     */
    public function sendMessage(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        $request->validate([
            'message' => 'required|string|max:5000',
            'reply_to_id' => 'nullable|integer|exists:class_set_messages,id',
        ]);

        try {
            $result = $this->chatService->sendMessage($classSetUuid, $userId, $request->input('message'), $request->input('reply_to_id'));

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Broadcast typing indicator
     */
    public function typing(Request $request, string $classSetUuid)
    {
        $user = $request->user();

        $this->chatService->broadcastTyping($classSetUuid, $user);

        return response()->json(['success' => true]);
    }

    /**
     * Edit a message
     */
    public function editMessage(Request $request, int $messageId)
    {
        $userId = $request->user()->id;

        $request->validate([
            'message' => 'required|string|max:5000',
        ]);

        $result = $this->chatService->editMessage($messageId, $userId, $request->input('message'));

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'message' => $result['message'],
        ]);
    }

    /**
     * Delete a message
     */
    public function deleteMessage(Request $request, int $messageId)
    {
        $userId = $request->user()->id;

        $result = $this->chatService->deleteMessage($messageId, $userId);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json(['success' => true]);
    }

    /**
     * Bulk delete messages
     */
    public function bulkDeleteMessages(Request $request)
    {
        $userId = $request->user()->id;

        $request->validate([
            'message_ids' => 'required|array',
            'message_ids.*' => 'integer',
        ]);

        $result = $this->chatService->bulkDeleteMessages($request->input('message_ids'), $userId);

        if (!$result['success']) {
            return response()->json(['error' => $result['error']], 422);
        }

        return response()->json([
            'success' => true,
            'deleted_count' => $result['deleted_count'],
        ]);
    }
}
