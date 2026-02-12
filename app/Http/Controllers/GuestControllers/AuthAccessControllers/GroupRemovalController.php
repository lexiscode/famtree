<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\GroupRemovalService;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GroupRemovalController extends Controller
{
    public function __construct(
        private GroupRemovalService $removalService,
        private ClassSetRepository $classSetRepository
    ) {
    }

    /**
     * Get pending removal data for a class set
     */
    public function show(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;
        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        if (!$this->classSetRepository->isMember($classSet->id, $userId)) {
            return response()->json(['error' => 'You must be a member.'], 403);
        }

        $removal = $this->removalService->getRemovalStatus($classSet->id, $userId);

        return response()->json([
            'removal' => $removal,
        ]);
    }

    /**
     * Initiate a member removal process
     */
    public function initiate(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        $request->validate([
            'target_user_id' => 'required|integer',
        ]);

        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        try {
            $result = $this->removalService->initiateRemoval(
                $classSet->id,
                $request->input('target_user_id'),
                $userId
            );

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }

    /**
     * Vote on a pending removal (admin only)
     */
    public function vote(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        $request->validate([
            'vote' => 'required|in:confirm,reject',
        ]);

        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        $removalStatus = $this->removalService->getRemovalStatus($classSet->id, $userId);
        if (!$removalStatus) {
            return response()->json(['error' => 'No pending removal.'], 404);
        }

        try {
            $result = $this->removalService->voteOnRemoval(
                $removalStatus['id'],
                $userId,
                $request->input('vote')
            );

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}
