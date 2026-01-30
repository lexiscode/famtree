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
        ]);

        try {
            $result = $this->chatService->sendMessage($classSetUuid, $userId, $request->input('message'));

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
}
