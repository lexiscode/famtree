<?php

namespace App\Http\Controllers\GuestControllers\AuthAccessControllers;

use App\Http\Controllers\Controller;
use App\Actions\GuestServices\AuthAccessServices\FamilyTreeService as ConnectionTreeService;
use Inertia\Inertia;

class ConnectionTreeController extends Controller
{
    public function __construct(
        private ConnectionTreeService $connectionTreeService
    ) {}

    /**
     * Display the user's connection tree visualization
     */
    public function index()
    {
        $user = auth()->user();

        if (!$user) {
            return redirect()->route('home');
        }

        // Get connection tree data for visualization
        $connectionTreeData = $this->connectionTreeService->buildFamilyTree($user->id);

        return Inertia::render('GuestPages/AuthAccessPages/YourTree/Index', [
            'connectionTreeData' => $connectionTreeData,
            'user' => [
                'id' => $user->id,
                'name' => trim(($user->first_name ?? '') . ' ' . ($user->last_name ?? '')),
                'username' => $user->username,
                'profile_image_url' => $user->profile_image_url,
                'status' => $user->status,
            ],
        ]);
    }
}
