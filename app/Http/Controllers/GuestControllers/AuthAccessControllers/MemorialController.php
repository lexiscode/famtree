<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Actions\GuestServices\MemorialService;
use App\Http\Controllers\Controller;
use App\Models\GuestModels\User;
use App\Repositories\GuestRepositories\MemorialMessageRepository;
use Illuminate\Http\Request;

class MemorialController extends Controller
{
    public function __construct(
        protected MemorialService $memorialService,
        protected MemorialMessageRepository $messageRepository
    ) {}

    /**
     * Get all memorial messages for a user.
     */
    public function getMessages(string $userUuid)
    {
        $deceased = User::where('uuid', $userUuid)->first();

        if (!$deceased) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (!$deceased->is_memorial) {
            return response()->json(['error' => 'This user is not memorialized'], 400);
        }

        $messages = $this->memorialService->getMemorialMessages($deceased);

        return response()->json([
            'messages' => $messages->map(function ($message) {
                return [
                    'id' => $message->id,
                    'message' => $message->message,
                    'relationship_type' => $message->relationship_type,
                    'created_at' => $message->created_at->toIso8601String(),
                    'author' => [
                        'id' => $message->author->id,
                        'uuid' => $message->author->uuid,
                        'first_name' => $message->author->first_name,
                        'last_name' => $message->author->last_name,
                        'profile_image_url' => $message->author->profile_image_url,
                    ],
                    'can_edit' => auth()->id() === $message->author_id,
                ];
            }),
        ]);
    }

    /**
     * Add a memorial message.
     */
    public function addMessage(Request $request, string $userUuid)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $deceased = User::where('uuid', $userUuid)->first();

        if (!$deceased) {
            return response()->json(['error' => 'User not found'], 404);
        }

        if (!$deceased->is_memorial) {
            return response()->json(['error' => 'This user is not memorialized'], 400);
        }

        $author = auth()->user();

        if (!$this->memorialService->canAddMemorialMessage($author, $deceased)) {
            return response()->json(['error' => 'Only close family members can add memorial messages'], 403);
        }

        try {
            $message = $this->memorialService->addMemorialMessage(
                $deceased,
                $author,
                $request->input('message')
            );

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $message->id,
                    'message' => $message->message,
                    'relationship_type' => $message->relationship_type,
                    'created_at' => $message->created_at->toIso8601String(),
                    'author' => [
                        'id' => $author->id,
                        'uuid' => $author->uuid,
                        'first_name' => $author->first_name,
                        'last_name' => $author->last_name,
                        'profile_image_url' => $author->profile_image_url,
                    ],
                    'can_edit' => true,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update a memorial message.
     */
    public function updateMessage(Request $request, int $messageId)
    {
        $request->validate([
            'message' => 'required|string|max:2000',
        ]);

        $message = $this->messageRepository->find($messageId);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        try {
            $updated = $this->memorialService->updateMemorialMessage(
                $message,
                auth()->user(),
                $request->input('message')
            );

            return response()->json([
                'success' => true,
                'message' => [
                    'id' => $updated->id,
                    'message' => $updated->message,
                    'relationship_type' => $updated->relationship_type,
                    'created_at' => $updated->created_at->toIso8601String(),
                    'updated_at' => $updated->updated_at->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }

    /**
     * Delete a memorial message.
     */
    public function deleteMessage(int $messageId)
    {
        $message = $this->messageRepository->find($messageId);

        if (!$message) {
            return response()->json(['error' => 'Message not found'], 404);
        }

        try {
            $this->memorialService->deleteMemorialMessage($message, auth()->user());

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 403);
        }
    }
}
