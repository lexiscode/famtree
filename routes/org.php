<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\OrgControllers\OrgAuthController;
use App\Http\Controllers\OrgControllers\DashboardController;
use App\Http\Controllers\OrgControllers\PostController;
use App\Http\Controllers\OrgControllers\BroadcastController;
use App\Http\Controllers\OrgControllers\AnalyticsController;
use App\Http\Controllers\OrgControllers\ProfileController;
use App\Http\Controllers\OrgControllers\StaffController;
use App\Http\Controllers\OrgControllers\RoleController;
use App\Http\Controllers\OrgControllers\GroupsController;
use App\Http\Controllers\OrgControllers\OrgGroupController;
use App\Http\Controllers\OrgControllers\FollowersController;
use App\Http\Controllers\OrgControllers\ActivityLogController;
use App\Http\Controllers\OrgControllers\OrgGroupChatController;
use App\Http\Controllers\OrgControllers\OrgGroupPollController;

Route::group(['prefix' => 'org', 'as' => 'org.', 'middleware' => ['web']], function () {

    // Guest Routes (Accessible without org login)
    Route::group(['middleware' => function ($request, $next) {
        if (Auth::guard('org')->check()) {
            return redirect()->route('org.dashboard');
        }
        return $next($request);
    }], function () {
        Route::get('/login', [OrgAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [OrgAuthController::class, 'login']);
        Route::get('/forgot-password', [OrgAuthController::class, 'showForgotPassword'])->name('forgot-password');
        Route::post('/forgot-password', [OrgAuthController::class, 'sendResetLink'])->name('send-password-reset');
        Route::get('/reset-password', [OrgAuthController::class, 'showResetPassword'])->name('show-reset-password');
        Route::post('/reset-password', [OrgAuthController::class, 'resetPassword'])->name('reset-password');
    });

    // Authenticated Org Routes
    Route::middleware(['auth:org', 'orgAuth'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Logout
        Route::post('/logout', [OrgAuthController::class, 'logout'])->name('logout');

        // Posts
        Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
        Route::get('/posts/create', [PostController::class, 'create'])->name('posts.create');
        Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
        Route::get('/posts/{id}', [PostController::class, 'show'])->name('posts.show');
        Route::get('/posts/{id}/edit', [PostController::class, 'edit'])->name('posts.edit');
        Route::put('/posts/{id}', [PostController::class, 'update'])->name('posts.update');
        Route::delete('/posts/{id}', [PostController::class, 'destroy'])->name('posts.destroy');
        Route::post('/posts/{id}/toggle-pin', [PostController::class, 'togglePin'])->name('posts.togglePin');
        Route::post('/posts/{id}/comments', [PostController::class, 'addComment'])->name('posts.comments.store');
        Route::delete('/posts/comments/{commentId}', [PostController::class, 'deleteComment'])->name('posts.comments.destroy');
        Route::post('/posts/comments/{commentId}/like', [PostController::class, 'toggleCommentLike'])->name('posts.comments.like');
        Route::post('/posts/{id}/reaction', [PostController::class, 'toggleReaction'])->name('posts.reaction.toggle');

        // Broadcasts
        Route::get('/broadcasts', [BroadcastController::class, 'index'])->name('broadcasts.index');
        Route::get('/broadcasts/create', [BroadcastController::class, 'create'])->name('broadcasts.create');
        Route::post('/broadcasts', [BroadcastController::class, 'store'])->name('broadcasts.store');
        Route::get('/broadcasts/{id}', [BroadcastController::class, 'show'])->name('broadcasts.show');
        Route::get('/broadcasts/{id}/edit', [BroadcastController::class, 'edit'])->name('broadcasts.edit');
        Route::put('/broadcasts/{id}', [BroadcastController::class, 'update'])->name('broadcasts.update');
        Route::post('/broadcasts/{id}/cancel', [BroadcastController::class, 'cancel'])->name('broadcasts.cancel');
        Route::post('/broadcasts/{id}/approve', [BroadcastController::class, 'approve'])->name('broadcasts.approve');
        Route::post('/broadcasts/{id}/reject', [BroadcastController::class, 'reject'])->name('broadcasts.reject');
        Route::post('/broadcasts/{id}/flag', [BroadcastController::class, 'flag'])->name('broadcasts.flag');
        Route::post('/broadcasts/{id}/unflag', [BroadcastController::class, 'unflag'])->name('broadcasts.unflag');
        Route::get('/broadcasts/{id}/analytics', [BroadcastController::class, 'analytics'])->name('broadcasts.analytics');

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // Activity Logs
        Route::get('/activity-logs', [ActivityLogController::class, 'index'])->name('activity-logs.index');

        // Profile
        Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::post('/profile/image', [ProfileController::class, 'uploadImage'])->name('profile.uploadImage');

        // Staff
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{id}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{id}', [StaffController::class, 'destroy'])->name('staff.destroy');

        // Roles
        Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
        Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('/roles/{id}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('/roles/{id}', [RoleController::class, 'destroy'])->name('roles.destroy');

        // Groups (Class Set hierarchy)
        Route::get('/groups', [GroupsController::class, 'index'])->name('groups.index');
        Route::post('/groups/{classSetId}/members/{userId}/force-remove', [GroupsController::class, 'forceRemoveMember'])->name('groups.force-remove');
        Route::post('/groups/{classSetId}/members/{userId}/appoint-admin', [GroupsController::class, 'appointAdmin'])->name('groups.appoint-admin');
        Route::post('/groups/{classSetId}/members/{userId}/remove-admin', [GroupsController::class, 'removeAdmin'])->name('groups.remove-admin');

        // Org Groups (SUG, Faculty Unions, etc.)
        Route::get('/org-groups', [OrgGroupController::class, 'index'])->name('org-groups.index');
        Route::post('/org-groups/{id}/suspend', [OrgGroupController::class, 'suspend'])->name('org-groups.suspend');
        Route::post('/org-groups/{id}/unsuspend', [OrgGroupController::class, 'unsuspend'])->name('org-groups.unsuspend');
        Route::post('/org-groups', [OrgGroupController::class, 'store'])->name('org-groups.store');
        Route::put('/org-groups/{id}', [OrgGroupController::class, 'update'])->name('org-groups.update');
        Route::delete('/org-groups/{id}', [OrgGroupController::class, 'destroy'])->name('org-groups.destroy');
        Route::post('/org-groups/{groupId}/members', [OrgGroupController::class, 'addMember'])->name('org-groups.add-member');
        Route::delete('/org-groups/{groupId}/members/{userId}', [OrgGroupController::class, 'removeMember'])->name('org-groups.remove-member');
        Route::put('/org-groups/{groupId}/members/{userId}/role', [OrgGroupController::class, 'updateMemberRole'])->name('org-groups.update-role');
        Route::post('/org-groups/{groupId}/handover', [OrgGroupController::class, 'handover'])->name('org-groups.handover');
        Route::get('/org-groups/{groupId}/term-history', [OrgGroupController::class, 'termHistory'])->name('org-groups.term-history');
        Route::get('/org-groups/{groupId}/search-users', [OrgGroupController::class, 'searchUsers'])->name('org-groups.search-users');
        Route::get('/org-groups/{groupId}/join-requests', [OrgGroupController::class, 'joinRequests'])->name('org-groups.join-requests');
        Route::post('/org-groups/{groupId}/join-requests/{requestId}/approve', [OrgGroupController::class, 'approveJoinRequest'])->name('org-groups.approve-join');
        Route::post('/org-groups/{groupId}/join-requests/{requestId}/reject', [OrgGroupController::class, 'rejectJoinRequest'])->name('org-groups.reject-join');
        Route::get('/org-groups/{groupId}/bans', [OrgGroupController::class, 'getBans'])->name('org-groups.bans');
        Route::post('/org-groups/{groupId}/ban/{userId}', [OrgGroupController::class, 'banMember'])->name('org-groups.ban');
        Route::delete('/org-groups/{groupId}/ban/{userId}', [OrgGroupController::class, 'unbanMember'])->name('org-groups.unban');
        Route::get('/org-groups/{groupId}/auto-rules', [OrgGroupController::class, 'getAutoRules'])->name('org-groups.auto-rules');
        Route::get('/org-groups/{groupId}/auto-rule-targets', [OrgGroupController::class, 'getAutoRuleTargets'])->name('org-groups.auto-rule-targets');
        Route::post('/org-groups/{groupId}/auto-rules', [OrgGroupController::class, 'createAutoRule'])->name('org-groups.create-auto-rule');
        Route::delete('/org-groups/{groupId}/auto-rules/{ruleId}', [OrgGroupController::class, 'deleteAutoRule'])->name('org-groups.delete-auto-rule');
        Route::post('/org-groups/{groupId}/auto-rules/{ruleId}/execute', [OrgGroupController::class, 'executeAutoRule'])->name('org-groups.execute-auto-rule');

        // Followers
        Route::get('/followers', [FollowersController::class, 'index'])->name('followers.index');
    });
});
