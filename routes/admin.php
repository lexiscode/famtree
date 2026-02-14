<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminControllers\DashboardController;
use App\Http\Controllers\AdminControllers\UserController;
use App\Http\Controllers\AdminControllers\OrganizationController;
use App\Http\Controllers\AdminControllers\OrgCategoryController;
use App\Http\Controllers\AdminControllers\PostController;
use App\Http\Controllers\AdminControllers\CommentController;
use App\Http\Controllers\AdminControllers\GalleryController;
use App\Http\Controllers\AdminControllers\ReportController;
use App\Http\Controllers\AdminControllers\BlockController;
use App\Http\Controllers\AdminControllers\BlogController;
use App\Http\Controllers\AdminControllers\ContactController;
use App\Http\Controllers\AdminControllers\MemorialController;
use App\Http\Controllers\AdminControllers\MessagingController;
use App\Http\Controllers\AdminControllers\FamilyTreeController;
use App\Http\Controllers\AdminControllers\ConnectionController;
use App\Http\Controllers\AdminControllers\ElectionController;
use App\Http\Controllers\AdminControllers\RemovalController;
use App\Http\Controllers\AdminControllers\AnalyticsController;
use App\Http\Controllers\AdminControllers\SettingsController;
use App\Http\Controllers\AdminControllers\SecurityController;
use App\Http\Controllers\AdminControllers\NotificationController;
use App\Http\Controllers\AdminControllers\EmailController;
use App\Http\Controllers\AdminControllers\SystemController;
use App\Http\Controllers\AdminControllers\PublicPageController;
use App\Http\Controllers\AdminControllers\TeamController;
use App\Http\Controllers\AdminControllers\PredictionController;


Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['web']], function () {

    // Guest Routes (Accessible without admin login)
    // Allow access only if admin is NOT authenticated
    Route::group(['middleware' => function ($request, $next) {
        if (Auth::guard('admin')->check()) {
            return redirect()->route('admin.dashboard');
        }
        return $next($request);
    }], function () {
        Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login']);
        Route::get('/forgot-password', [AdminAuthController::class, 'showForgotPassword'])->name('forgot-password');
        Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword'])->name('send-password-reset');
        Route::get('/reset-password', [AdminAuthController::class, 'showResetPassword'])->name('show-reset-password');
        Route::post('/reset-password', [AdminAuthController::class, 'resetPassword'])->name('reset-password');
    });

    // Authenticated Admin Routes (Requires 'auth:admin' and 'admin' middleware)
    Route::middleware(['auth:admin', 'admin'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Logout
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');

        // User Management Routes
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
        Route::get('/api/users', [UserController::class, 'list'])->name('users.list');
        Route::post('/users/{id}/suspend', [UserController::class, 'suspend'])->name('users.suspend');
        Route::post('/users/{id}/unsuspend', [UserController::class, 'unsuspend'])->name('users.unsuspend');
        Route::post('/users/{id}/deactivate', [UserController::class, 'deactivate'])->name('users.deactivate');
        Route::post('/users/{id}/ban', [UserController::class, 'ban'])->name('users.ban');
        Route::post('/users/{id}/schedule-delete', [UserController::class, 'scheduleDelete'])->name('users.schedule-delete');
        Route::post('/users/{id}/cancel-delete', [UserController::class, 'cancelDelete'])->name('users.cancel-delete');
        Route::post('/users/{id}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
        Route::post('/users/{id}/disable-2fa', [UserController::class, 'disable2FA'])->name('users.disable-2fa');
        Route::post('/users/{id}/enable-2fa', [UserController::class, 'enable2FA'])->name('users.enable-2fa');
        Route::post('/users/{id}/complete-onboarding', [UserController::class, 'completeOnboarding'])->name('users.complete-onboarding');
        Route::post('/users/{id}/reset-onboarding', [UserController::class, 'resetOnboarding'])->name('users.reset-onboarding');
        Route::get('/api/users/{id}/history', [UserController::class, 'actionHistory'])->name('users.history');
        Route::get('/users/{id}/child-accounts', [UserController::class, 'childAccounts'])->name('users.childAccounts');
        Route::post('/users/{id}/child-accounts', [UserController::class, 'createChildAccount'])->name('users.createChildAccount');
        Route::put('/users/{parentId}/child-accounts/{childId}', [UserController::class, 'updateChildAccount'])->name('users.updateChildAccount');
        Route::delete('/users/{parentId}/child-accounts/{childId}', [UserController::class, 'deleteChildAccount'])->name('users.deleteChildAccount');
        Route::get('/api/users/{id}/family-tree', [UserController::class, 'familyTree'])->name('users.familyTree');
        Route::get('/users/{id}/connections', [UserController::class, 'connections'])->name('users.connections');
        Route::delete('/users/{id}/connections/{connectionId}', [UserController::class, 'removeConnection'])->name('users.removeConnection');

        // Phase 1: Organization Management
        Route::get('/organizations', [OrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/organizations/create', [OrganizationController::class, 'create'])->name('organizations.create');
        Route::post('/organizations', [OrganizationController::class, 'store'])->name('organizations.store');
        Route::get('/organizations/{id}', [OrganizationController::class, 'show'])->name('organizations.show');
        Route::get('/organizations/{id}/edit', [OrganizationController::class, 'edit'])->name('organizations.edit');
        Route::put('/organizations/{id}', [OrganizationController::class, 'update'])->name('organizations.update');
        Route::post('/organizations/{id}/suspend', [OrganizationController::class, 'suspend'])->name('organizations.suspend');
        Route::post('/organizations/{id}/unsuspend', [OrganizationController::class, 'unsuspend'])->name('organizations.unsuspend');
        Route::delete('/organizations/{id}', [OrganizationController::class, 'destroy'])->name('organizations.destroy');
        Route::post('/organizations/{id}/staff', [OrganizationController::class, 'createStaff'])->name('organizations.createStaff');
        Route::post('/organizations/staff/{id}/disable', [OrganizationController::class, 'disableStaff'])->name('organizations.disableStaff');
        Route::post('/organizations/staff/{id}/reset-password', [OrganizationController::class, 'resetStaffPassword'])->name('organizations.resetStaffPassword');
        Route::get('/organization-categories', [OrgCategoryController::class, 'index'])->name('orgCategories.index');
        Route::post('/organization-categories', [OrgCategoryController::class, 'store'])->name('orgCategories.store');
        Route::put('/organization-categories/{id}', [OrgCategoryController::class, 'update'])->name('orgCategories.update');
        Route::delete('/organization-categories/{id}', [OrgCategoryController::class, 'destroy'])->name('orgCategories.destroy');

        // Phase 2: Content Moderation
        Route::get('/content/posts', [PostController::class, 'index'])->name('content.posts');
        Route::get('/content/posts/{id}', [PostController::class, 'show'])->name('content.posts.show');
        Route::delete('/content/posts/{id}', [PostController::class, 'destroy'])->name('content.posts.destroy');
        Route::post('/content/posts/{id}/flag', [PostController::class, 'flag'])->name('content.posts.flag');
        Route::post('/content/posts/{id}/unflag', [PostController::class, 'unflag'])->name('content.posts.unflag');
        Route::delete('/content/comments/{id}', [CommentController::class, 'destroy'])->name('content.comments.destroy');
        Route::get('/content/galleries', [GalleryController::class, 'index'])->name('content.galleries');
        Route::get('/content/galleries/{id}', [GalleryController::class, 'show'])->name('content.galleries.show');
        Route::delete('/content/galleries/{id}', [GalleryController::class, 'destroy'])->name('content.galleries.destroy');
        Route::delete('/content/galleries/image/{id}', [GalleryController::class, 'destroyImage'])->name('content.galleries.destroyImage');
        Route::get('/content/org-posts', [PostController::class, 'orgPosts'])->name('content.orgPosts');

        // Phase 3: Report & Safety Management
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/{id}', [ReportController::class, 'show'])->name('reports.show');
        Route::post('/reports/{id}/review', [ReportController::class, 'review'])->name('reports.review');
        Route::post('/reports/{id}/resolve', [ReportController::class, 'resolve'])->name('reports.resolve');
        Route::post('/reports/{id}/dismiss', [ReportController::class, 'dismiss'])->name('reports.dismiss');
        Route::get('/blocks', [BlockController::class, 'index'])->name('blocks.index');
        Route::delete('/blocks/{id}', [BlockController::class, 'destroy'])->name('blocks.destroy');

        // Phase 4: Blog & Contact Management
        Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
        Route::get('/blog/create', [BlogController::class, 'create'])->name('blog.create');
        Route::post('/blog', [BlogController::class, 'store'])->name('blog.store');
        Route::get('/blog/{id}/edit', [BlogController::class, 'edit'])->name('blog.edit');
        Route::put('/blog/{id}', [BlogController::class, 'update'])->name('blog.update');
        Route::delete('/blog/{id}', [BlogController::class, 'destroy'])->name('blog.destroy');
        Route::post('/blog/{id}/publish', [BlogController::class, 'publish'])->name('blog.publish');
        Route::post('/blog/{id}/unpublish', [BlogController::class, 'unpublish'])->name('blog.unpublish');
        Route::get('/contact', [ContactController::class, 'index'])->name('contact.index');
        Route::get('/contact/{id}', [ContactController::class, 'show'])->name('contact.show');
        Route::post('/contact/{id}/read', [ContactController::class, 'markRead'])->name('contact.markRead');
        Route::post('/contact/{id}/respond', [ContactController::class, 'respond'])->name('contact.respond');
        Route::delete('/contact/{id}', [ContactController::class, 'destroy'])->name('contact.destroy');

        // Phase 5: Deceased Verification & Memorial
        Route::get('/memorial/verifications', [MemorialController::class, 'verifications'])->name('memorial.verifications');
        Route::get('/memorial/verifications/{id}', [MemorialController::class, 'verificationDetail'])->name('memorial.verificationDetail');
        Route::post('/memorial/verifications/{id}/cancel', [MemorialController::class, 'cancel'])->name('memorial.cancel');
        Route::post('/memorial/verifications/{id}/expedite', [MemorialController::class, 'expedite'])->name('memorial.expedite');
        Route::post('/memorial/override-deceased/{id}', [MemorialController::class, 'overrideDeceased'])->name('memorial.overrideDeceased');
        Route::post('/memorial/override-alive/{id}', [MemorialController::class, 'overrideAlive'])->name('memorial.overrideAlive');
        Route::get('/memorial/memorialized', [MemorialController::class, 'memorializedUsers'])->name('memorial.memorialized');

        // Phase 6: Messaging & Chat Oversight
        Route::get('/messaging/conversations', [MessagingController::class, 'conversations'])->name('messaging.conversations');
        Route::get('/messaging/conversations/{id}', [MessagingController::class, 'viewConversation'])->name('messaging.viewConversation');
        Route::delete('/messaging/messages/{id}', [MessagingController::class, 'deleteMessage'])->name('messaging.deleteMessage');
        Route::get('/messaging/tree-chats', [MessagingController::class, 'treeChats'])->name('messaging.treeChats');
        Route::get('/messaging/tree-chats/{id}', [MessagingController::class, 'viewTreeChat'])->name('messaging.viewTreeChat');
        Route::delete('/messaging/tree-messages/{id}', [MessagingController::class, 'deleteTreeMessage'])->name('messaging.deleteTreeMessage');
        Route::get('/messaging/class-set-chats', [MessagingController::class, 'classSetChats'])->name('messaging.classSetChats');
        Route::get('/messaging/class-set-chats/{id}', [MessagingController::class, 'viewClassSetChat'])->name('messaging.viewClassSetChat');
        Route::delete('/messaging/class-set-messages/{id}', [MessagingController::class, 'deleteClassSetMessage'])->name('messaging.deleteClassSetMessage');

        // Phase 7: Family Tree & Connection Oversight
        Route::get('/family-trees', [FamilyTreeController::class, 'index'])->name('familyTrees.index');
        Route::get('/family-trees/{id}', [FamilyTreeController::class, 'show'])->name('familyTrees.show');
        Route::delete('/family-trees/{id}', [FamilyTreeController::class, 'destroy'])->name('familyTrees.destroy');
        Route::post('/family-trees/{id}/toggle-visibility', [FamilyTreeController::class, 'toggleVisibility'])->name('familyTrees.toggleVisibility');
        Route::get('/connections', [ConnectionController::class, 'index'])->name('connections.index');

        // Phase 8: Group Administration Oversight
        Route::get('/groups/elections', [ElectionController::class, 'index'])->name('elections.index');
        Route::get('/groups/elections/{id}', [ElectionController::class, 'show'])->name('elections.show');
        Route::post('/groups/elections/{id}/cancel', [ElectionController::class, 'cancel'])->name('elections.cancel');
        Route::post('/groups/elections/{id}/extend', [ElectionController::class, 'extend'])->name('elections.extend');
        Route::get('/groups/removals', [RemovalController::class, 'index'])->name('removals.index');
        Route::get('/groups/removals/{id}', [RemovalController::class, 'show'])->name('removals.show');
        Route::post('/groups/removals/{id}/cancel', [RemovalController::class, 'cancel'])->name('removals.cancel');
        Route::post('/groups/removals/{id}/execute', [RemovalController::class, 'execute'])->name('removals.execute');

        // Phase 9: Advanced Analytics
        Route::get('/analytics', [AnalyticsController::class, 'overview'])->name('analytics.overview');
        Route::get('/analytics/users', [AnalyticsController::class, 'users'])->name('analytics.users');
        Route::get('/analytics/content', [AnalyticsController::class, 'content'])->name('analytics.content');
        Route::get('/analytics/connections', [AnalyticsController::class, 'connections'])->name('analytics.connections');
        Route::get('/analytics/organizations', [AnalyticsController::class, 'organizations'])->name('analytics.organizations');

        // Phase 10: System Configuration & Settings
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings', [SettingsController::class, 'update'])->name('settings.update');
        Route::post('/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clearCache');
        Route::post('/settings/maintenance', [SettingsController::class, 'toggleMaintenance'])->name('settings.maintenance');

        // Phase 11: Security & Compliance
        Route::get('/security', [SecurityController::class, 'dashboard'])->name('security.dashboard');
        Route::get('/security/audit-log', [SecurityController::class, 'auditLog'])->name('security.auditLog');
        Route::post('/security/force-logout/{id}', [SecurityController::class, 'forceLogout'])->name('security.forceLogout');
        Route::get('/security/data-privacy', [SecurityController::class, 'dataPrivacy'])->name('security.dataPrivacy');
        Route::post('/security/data-export/{id}', [SecurityController::class, 'dataExport'])->name('security.dataExport');
        Route::post('/security/anonymize/{id}', [SecurityController::class, 'anonymize'])->name('security.anonymize');

        // Phase 12: Notification & Email Management
        Route::get('/notifications/broadcast', [NotificationController::class, 'broadcast'])->name('notifications.broadcast');
        Route::post('/notifications/broadcast', [NotificationController::class, 'sendBroadcast'])->name('notifications.sendBroadcast');
        Route::get('/notifications/history', [NotificationController::class, 'history'])->name('notifications.history');
        Route::get('/emails', [EmailController::class, 'index'])->name('emails.index');
        Route::get('/emails/failed', [EmailController::class, 'failed'])->name('emails.failed');
        Route::post('/emails/test', [EmailController::class, 'test'])->name('emails.test');

        // Phase 13: Scheduled Tasks & System Health
        Route::get('/system/scheduler', [SystemController::class, 'scheduler'])->name('system.scheduler');
        Route::get('/system/health', [SystemController::class, 'health'])->name('system.health');
        Route::get('/system/failed-jobs', [SystemController::class, 'failedJobs'])->name('system.failedJobs');
        Route::post('/system/retry-job/{id}', [SystemController::class, 'retryJob'])->name('system.retryJob');
        Route::post('/system/run-task', [SystemController::class, 'runTask'])->name('system.runTask');

        // Phase 14: Public Pages & SEO
        Route::get('/public-pages', [PublicPageController::class, 'index'])->name('publicPages.index');
        Route::get('/public-pages/create', [PublicPageController::class, 'create'])->name('publicPages.create');
        Route::post('/public-pages', [PublicPageController::class, 'store'])->name('publicPages.store');
        Route::get('/public-pages/{id}/edit', [PublicPageController::class, 'edit'])->name('publicPages.edit');
        Route::put('/public-pages/{id}', [PublicPageController::class, 'update'])->name('publicPages.update');
        Route::delete('/public-pages/{id}', [PublicPageController::class, 'destroy'])->name('publicPages.destroy');
        Route::post('/public-pages/{id}/publish', [PublicPageController::class, 'publish'])->name('publicPages.publish');

        // Phase 16: Prediction League Management
        Route::get('/predictions', [PredictionController::class, 'index'])->name('predictions.index');
        Route::get('/predictions/create', [PredictionController::class, 'create'])->name('predictions.create');
        Route::post('/predictions/seasons', [PredictionController::class, 'storeSeason'])->name('predictions.storeSeason');
        Route::get('/predictions/seasons/{id}', [PredictionController::class, 'show'])->name('predictions.show');
        Route::get('/predictions/seasons/{id}/edit', [PredictionController::class, 'edit'])->name('predictions.edit');
        Route::put('/predictions/seasons/{id}', [PredictionController::class, 'updateSeason'])->name('predictions.updateSeason');
        Route::post('/predictions/seasons/{id}/activate', [PredictionController::class, 'activateSeason'])->name('predictions.activateSeason');
        Route::post('/predictions/seasons/{id}/complete', [PredictionController::class, 'completeSeason'])->name('predictions.completeSeason');
        Route::post('/predictions/seasons/{id}/gameweeks', [PredictionController::class, 'storeGameweek'])->name('predictions.storeGameweek');
        Route::put('/predictions/gameweeks/{id}', [PredictionController::class, 'updateGameweek'])->name('predictions.updateGameweek');
        Route::post('/predictions/seasons/{id}/fixtures', [PredictionController::class, 'storeFixture'])->name('predictions.storeFixture');
        Route::put('/predictions/fixtures/{id}', [PredictionController::class, 'updateFixture'])->name('predictions.updateFixture');
        Route::post('/predictions/fixtures/{id}/result', [PredictionController::class, 'enterResult'])->name('predictions.enterResult');
        Route::post('/predictions/fixtures/{id}/cancel', [PredictionController::class, 'cancelFixture'])->name('predictions.cancelFixture');
        Route::get('/predictions/seasons/{id}/standings', [PredictionController::class, 'standings'])->name('predictions.standings');
        Route::get('/predictions/seasons/{id}/badges', [PredictionController::class, 'badges'])->name('predictions.badges');

        // Phase 15: Admin Team & Role Management
        Route::get('/team', [TeamController::class, 'index'])->name('team.index');
        Route::post('/team', [TeamController::class, 'store'])->name('team.store');
        Route::put('/team/{id}', [TeamController::class, 'update'])->name('team.update');
        Route::post('/team/{id}/disable', [TeamController::class, 'disable'])->name('team.disable');
        Route::post('/team/{id}/reset-password', [TeamController::class, 'resetPassword'])->name('team.resetPassword');
    });

});
