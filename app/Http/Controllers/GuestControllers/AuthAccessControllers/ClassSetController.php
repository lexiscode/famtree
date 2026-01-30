<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\ClassSetService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ClassSetController extends Controller
{
    public function __construct(private ClassSetService $classSetService)
    {
    }

    /**
     * Join a class set
     */
    public function join(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->classSetService->joinClassSet($classSetUuid, $userId);

            return back()->with('success', $result['message']);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Leave a class set
     */
    public function leave(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->classSetService->leaveClassSet($classSetUuid, $userId);

            return back()->with('success', $result['message']);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }
    }

    /**
     * Get members of a class set
     */
    public function members(Request $request, string $classSetUuid)
    {
        $userId = $request->user()->id;

        try {
            $result = $this->classSetService->getClassSetMembers($classSetUuid, $userId);

            if (!$result) {
                return response()->json(['error' => 'Class set not found'], 404);
            }

            return response()->json($result);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 403);
        }
    }
}
