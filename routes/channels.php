<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('family-tree.{treeId}', function ($user, $treeId) {
    // Since we use UUID for route model binding, we need to resolve UUID to tree ID
    $tree = \App\Models\GuestModels\FamilyTree::where('uuid', $treeId)->first();

    if (!$tree) {
        return false;
    }

    $treeRepository = app(\App\Repositories\GuestRepositories\FamilyTreeRepository::class);
    $adminRepository = app(\App\Repositories\GuestRepositories\AuthAccessRepositories\FamilyTreeAdminRepository::class);

    $isMember = $treeRepository->isMember($tree->id, $user->id);
    $isAdmin = $adminRepository->isAdmin($tree->id, $user->id);

    if ($isMember || $isAdmin) {
        return [
            'id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'profile_image_url' => $user->profile_image_url,
        ];
    }

    return false;
});
