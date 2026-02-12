<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\GroupElectionService;
use App\Repositories\GuestRepositories\AuthAccessRepositories\ClassSetRepository;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GroupElectionController extends Controller
{
    public function __construct(
        private GroupElectionService $electionService,
        private ClassSetRepository $classSetRepository
    ) {
    }

    /**
     * Get active election data for a class set
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

        $election = $this->electionService->getElectionStatus($classSet->id, $userId);

        return response()->json([
            'election' => $election,
        ]);
    }

    /**
     * Cast a vote in an election
     */
    public function vote(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        $request->validate([
            'candidate_id' => 'required|integer',
        ]);

        $classSet = $this->classSetRepository->getClassSetByUuid($classSetUuid);

        if (!$classSet) {
            return response()->json(['error' => 'Group not found.'], 404);
        }

        $election = $this->electionService->getElectionStatus($classSet->id, $userId);
        if (!$election) {
            return response()->json(['error' => 'No active election.'], 404);
        }

        try {
            $result = $this->electionService->castVote(
                $election['id'],
                $userId,
                $request->input('candidate_id')
            );

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }
    }
}
