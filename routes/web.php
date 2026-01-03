<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestControllers\AuthController;
use App\Http\Controllers\GuestControllers\OAuthController;
use App\Http\Controllers\GuestControllers\BlogController;
use App\Http\Controllers\GuestControllers\HomeController;
use App\Http\Controllers\GuestControllers\AboutController;
use App\Http\Controllers\GuestControllers\ContactController;
use App\Http\Controllers\GuestControllers\FeaturesController;
use App\Http\Controllers\GuestControllers\HowItWorksController;
use App\Http\Controllers\GuestControllers\FamilyPreviewController;
use App\Http\Controllers\GuestControllers\FamilyExplorerController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\LandingPageController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ConnectionRequestController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ConnectionViewController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\SuggestedConnectionController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ProfileController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\FamilyTreeController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ConnectionTreeController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ChildAccountController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\GalleryController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\AccountSettingsController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\PrivacyController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\PostController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ConnectionFeedsController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\UserReportController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\UserBlockController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\UserFollowController;
use App\Http\Controllers\GuestControllers\OnboardingController;
use App\Http\Controllers\GuestControllers\StatusController;
use App\Http\Controllers\GuestControllers\NotificationController;
use App\Http\Controllers\GuestControllers\SearchController;
use Inertia\Inertia;



// Home / Landing Page - Conditional based on auth status
Route::get('/', function (Request $request) {
    if (auth()->check()) {
        // If the user is authenticated, redirect to landing page for logged-in users
        return app(LandingPageController::class)->index($request);
    }
    return app(HomeController::class)->index();
})->name('home');

/*
|--------------------------------------------------------------------------
| Non-logged-in Guest Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'guest'])->group(function () {
    Route::get('/about', [AboutController::class, 'index'])->name('about');
    Route::get('/features', [FeaturesController::class, 'index'])->name('features');
    Route::get('/how-it-works', [HowItWorksController::class, 'index'])->name('how-it-works');
    Route::get('/blog', [BlogController::class, 'index'])->name('blog.index');
    Route::get('/blog/{slug}', [BlogController::class, 'show'])->name('blog.show');
    Route::get('/contact', [ContactController::class, 'index'])->name('contact');
    Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');
    Route::get('/families', [FamilyExplorerController::class, 'index'])->name('families.index');
    Route::get('/families/{slug}', [FamilyPreviewController::class, 'show'])->name('families.show');

    // Authentication routes
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

    // OAuth routes
    Route::get('/auth/google', [OAuthController::class, 'redirectToGoogle'])->name('auth.google');
    Route::get('/auth/google/callback', [OAuthController::class, 'handleGoogleCallback'])->name('auth.google.callback');
    Route::get('/auth/oauth/complete', [OAuthController::class, 'showCompletionForm'])->name('auth.oauth.complete');
    Route::post('/auth/oauth/complete', [OAuthController::class, 'completeRegistration'])->name('auth.oauth.complete.submit');
});

// 2FA verification routes (accessible without full authentication)
Route::middleware(['web'])->group(function () {
    Route::get('/auth/2fa-verify', [AuthController::class, 'show2FAVerify'])->name('auth.2fa-verify');
    Route::post('/auth/verify-2fa', [AuthController::class, 'verify2FA'])->name('auth.verify-2fa');
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Connection routes
    Route::prefix('connections')->group(function () {
        Route::get('/', [ConnectionRequestController::class, 'index'])->name('connections.index');
        Route::get('/pending', [ConnectionRequestController::class, 'pending'])->name('connections.pending');
        Route::get('/sent', [ConnectionRequestController::class, 'sent'])->name('connections.sent');
        Route::get('/create', [ConnectionRequestController::class, 'create'])->name('connections.create');
        Route::get('/user/{userId}', [ConnectionViewController::class, 'viewUserConnections'])->name('connections.view-user');
        Route::post('/request', [ConnectionRequestController::class, 'store'])->name('connections.store');
        Route::post('/{connection}/accept', [ConnectionRequestController::class, 'accept'])->name('connections.accept');
        Route::post('/{connection}/decline', [ConnectionRequestController::class, 'decline'])->name('connections.decline');
        Route::post('/{connection}/undo-request', [ConnectionRequestController::class, 'undoRequest'])->name('connections.undo-request');
        Route::post('/{connection}/undo-acceptance', [ConnectionRequestController::class, 'undoAcceptance'])->name('connections.undo-acceptance');
        Route::get('/search-users', [ConnectionRequestController::class, 'searchUsers'])->name('connections.search-users');
        Route::get('/relationship-types', [ConnectionRequestController::class, 'relationshipTypes'])->name('connections.relationship-types');
    });

    // Suggested family members routes
    Route::prefix('suggested-connections')->group(function () {
        Route::get('/', [SuggestedConnectionController::class, 'index'])->name('suggested-connections.index');
        Route::post('/list', [SuggestedConnectionController::class, 'list'])->name('suggested-connections.list');
        Route::get('/relationship-types', [SuggestedConnectionController::class, 'relationshipTypes'])->name('suggested-connections.relationship-types');
        Route::get('/count', [SuggestedConnectionController::class, 'count'])->name('suggested-connections.count');
    });

    // Profile routes - only for viewing other users' profiles
    Route::get('/profile/{userId}', [ProfileController::class, 'viewProfile'])->name('profile.view');

    // Family Tree routes (using UUID instead of ID)
    Route::prefix('family-tree')->group(function () {
        // List trees (updated to show admin trees)
        Route::get('/', [FamilyTreeController::class, 'index'])->name('family-tree.index');

        // Create/store with validation
        Route::get('/create', [FamilyTreeController::class, 'create'])->name('family-tree.create');
        Route::post('/', [FamilyTreeController::class, 'store'])->name('family-tree.store');

        // View tree (UUID route model binding)
        Route::get('/{familyTree}', [FamilyTreeController::class, 'show'])->name('family-tree.show');

        // Edit/update/delete (admin-only, UUID route model binding)
        Route::get('/{familyTree}/edit', [FamilyTreeController::class, 'edit'])->name('family-tree.edit');
        Route::put('/{familyTree}', [FamilyTreeController::class, 'update'])->name('family-tree.update');
        Route::delete('/{familyTree}', [FamilyTreeController::class, 'destroy'])->name('family-tree.destroy');

        // Member management (nuclear family only, UUID route model binding)
        Route::post('/{familyTree}/add-member', [FamilyTreeController::class, 'addMember'])->name('family-tree.add-member');
        Route::delete('/{familyTree}/members/{userId}', [FamilyTreeController::class, 'removeMember'])->name('family-tree.remove-member');

        // Tree data (UUID route model binding)
        Route::get('/{familyTree}/data', [FamilyTreeController::class, 'getTreeData'])->name('family-tree.data');

        // Tree connection requests
        Route::post('/connections/send', [FamilyTreeController::class, 'sendConnectionRequest'])->name('family-tree.connections.send');
        Route::post('/connections/{connection}/accept', [FamilyTreeController::class, 'acceptConnectionRequest'])->name('family-tree.connections.accept');
        Route::post('/connections/{connection}/decline', [FamilyTreeController::class, 'declineConnectionRequest'])->name('family-tree.connections.decline');
        Route::get('/{familyTree}/connections', [FamilyTreeController::class, 'getConnectionRequests'])->name('family-tree.connections');

        // Admin management (UUID route model binding)
        Route::get('/{familyTree}/admins', [FamilyTreeController::class, 'getAdmins'])->name('family-tree.admins');

        // Tree Chat routes (UUID route model binding)
        Route::get('/{familyTree}/chat/messages', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'getMessages'])->name('family-tree.chat.messages');
        Route::post('/{familyTree}/chat/send', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'sendMessage'])->name('family-tree.chat.send');
        Route::post('/{familyTree}/chat/typing', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'typing'])->name('family-tree.chat.typing');
        Route::post('/{familyTree}/chat/mark-read', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'markAsRead'])->name('family-tree.chat.mark-read');
    });

    // Your Tree (Connection Tree Visualization) route
    Route::get('/your-tree', [ConnectionTreeController::class, 'index'])->name('your-tree.index');

    // View Another User's Tree route
    Route::get('/profile/{userId}/tree', [ConnectionTreeController::class, 'viewUserTree'])->name('profile.tree');

    // Child Account routes
    Route::prefix('child-accounts')->group(function () {
        Route::get('/', [ChildAccountController::class, 'index'])->name('child-accounts.index');
        Route::get('/create', [ChildAccountController::class, 'create'])->name('child-accounts.create');
        Route::post('/', [ChildAccountController::class, 'store'])->name('child-accounts.store');
        Route::get('/credentials/{childId}', [ChildAccountController::class, 'showCredentials'])->name('child-accounts.show-credentials');
        Route::get('/{childId}', [ChildAccountController::class, 'show'])->name('child-accounts.show');
        Route::delete('/{childId}', [ChildAccountController::class, 'destroy'])->name('child-accounts.destroy');
        Route::post('/{childId}/set-email', [ChildAccountController::class, 'setEmail'])->name('child-accounts.set-email');
        Route::get('/api/children', [ChildAccountController::class, 'getChildren'])->name('child-accounts.get-children');
    });

    // Status Management routes
    Route::prefix('status')->group(function () {
        Route::post('/update', [StatusController::class, 'updateStatus'])->name('status.update');
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index'])->name('notifications.index');
        Route::get('/unread', [NotificationController::class, 'getUnread'])->name('notifications.get-unread');
        Route::get('/all', [NotificationController::class, 'getAll'])->name('notifications.get-all');
        Route::get('/count', [NotificationController::class, 'getCount'])->name('notifications.get-count');
        Route::post('/{notificationId}/read', [NotificationController::class, 'markAsRead'])->name('notifications.mark-as-read');
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead'])->name('notifications.mark-all-as-read');
        Route::delete('/{notificationId}', [NotificationController::class, 'delete'])->name('notifications.delete');
        Route::get('/{notificationId}', [NotificationController::class, 'show'])->name('notifications.show');
    });

    // Search & Discovery routes
    Route::prefix('search')->group(function () {
        Route::get('/users', [SearchController::class, 'searchUsers'])->name('search.users');
        Route::get('/featured', [SearchController::class, 'getFeatured'])->name('search.featured');
        Route::get('/suggested', [SearchController::class, 'getSuggested'])->name('search.suggested');
    });

    // Search pages
    Route::get('/search', function () {
        return Inertia::render('AuthAccessPages/Search/Users');
    })->name('search.index');

    // Follow/Unfollow routes
    Route::prefix('users')->group(function () {
        Route::post('/{userId}/follow', [UserFollowController::class, 'follow'])->name('users.follow');
        Route::post('/{userId}/unfollow', [UserFollowController::class, 'unfollow'])->name('users.unfollow');
        Route::get('/{userId}/followers', [UserFollowController::class, 'followers'])->name('users.followers');
        Route::get('/{userId}/following', [UserFollowController::class, 'following'])->name('users.following');
    });

    // Gallery routes
    Route::prefix('galleries')->group(function () {
        Route::get('/', [GalleryController::class, 'index'])->name('galleries.index');
        Route::get('/user/{userId}', [GalleryController::class, 'viewUser'])->name('galleries.view-user');
        Route::post('/', [GalleryController::class, 'store'])->name('galleries.store');
        Route::delete('/{galleryId}', [GalleryController::class, 'destroy'])->name('galleries.destroy');
    });

    // Connection Feeds routes
    Route::get('/connection-feeds', [ConnectionFeedsController::class, 'index'])->name('connection-feeds.index');

    // Stories / Posts routes
    Route::prefix('stories')->group(function () {
        Route::get('/', [PostController::class, 'index'])->name('stories.index');
        Route::post('/', [PostController::class, 'store'])->name('stories.store');
        Route::get('/search', [PostController::class, 'search'])->name('stories.search');
        Route::get('/filter', [PostController::class, 'filterByType'])->name('stories.filter');
        Route::get('/user/{userId}', [PostController::class, 'viewUser'])->name('stories.view-user');
        Route::get('/{postId}', [PostController::class, 'show'])->name('stories.show');
        Route::put('/{postId}', [PostController::class, 'update'])->name('stories.update');
        Route::delete('/{postId}', [PostController::class, 'destroy'])->name('stories.destroy');

        // Comments
        Route::post('/{postId}/comments', [PostController::class, 'addComment'])->name('stories.comments.store');
        Route::delete('/comments/{commentId}', [PostController::class, 'deleteComment'])->name('stories.comments.destroy');

        // Reactions
        Route::post('/{postId}/reactions', [PostController::class, 'addReaction'])->name('stories.reactions.store');
        Route::delete('/{postId}/reactions', [PostController::class, 'removeReaction'])->name('stories.reactions.destroy');
    });

    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/account', function () {
            return Inertia::render('AuthAccessPages/Settings/AccountSettings');
        })->name('settings.account');

        Route::post('/account/change-password', [AccountSettingsController::class, 'changePassword'])->name('settings.change-password');
        Route::post('/account/change-email', [AccountSettingsController::class, 'changeEmail'])->name('settings.change-email');
        Route::post('/account/update-profile', [AccountSettingsController::class, 'updateProfile'])->name('settings.update-profile');
        Route::post('/account/delete', [AccountSettingsController::class, 'deleteAccount'])->name('settings.delete-account');

        // 2FA routes
        Route::post('/account/2fa/generate', [AccountSettingsController::class, 'generateTwoFA'])->name('settings.2fa.generate');
        Route::post('/account/2fa/enable', [AccountSettingsController::class, 'enableTwoFA'])->name('settings.2fa.enable');
        Route::post('/account/2fa/disable', [AccountSettingsController::class, 'disableTwoFA'])->name('settings.2fa.disable');
        Route::get('/account/2fa/status', [AccountSettingsController::class, 'getTwoFAStatus'])->name('settings.2fa.status');

        Route::get('/privacy', function () {
            return Inertia::render('AuthAccessPages/Settings/PrivacySettings');
        })->name('settings.privacy');

        Route::post('/privacy/profile-visibility', [PrivacyController::class, 'updateProfileVisibility'])->name('settings.update-profile-visibility');
        Route::post('/privacy/field-privacy', [PrivacyController::class, 'updateFieldPrivacy'])->name('settings.update-field-privacy');
        Route::get('/privacy/field-privacy', [PrivacyController::class, 'getFieldPrivacy'])->name('settings.get-field-privacy');
        Route::post('/privacy/content-privacy', [PrivacyController::class, 'updateContentPrivacy'])->name('settings.update-content-privacy');
        Route::get('/privacy/content-privacy', [PrivacyController::class, 'getContentPrivacy'])->name('settings.get-content-privacy');
        Route::post('/privacy/nuclear-family-blur', [PrivacyController::class, 'updateNuclearFamilyBlur'])->name('settings.update-nuclear-family-blur');
        Route::get('/privacy/nuclear-family-blur', [PrivacyController::class, 'getNuclearFamilyBlur'])->name('settings.get-nuclear-family-blur');

        Route::get('/notifications', function () {
            return Inertia::render('AuthAccessPages/Settings/NotificationSettings');
        })->name('settings.notifications');
    });

    // User Report routes
    Route::prefix('reports')->group(function () {
        Route::post('/users', [UserReportController::class, 'store'])->name('reports.store');
        Route::get('/my-reports', [UserReportController::class, 'myReports'])->name('reports.my-reports');
    });

    // User Block routes
    Route::prefix('blocks')->group(function () {
        Route::get('/', [UserBlockController::class, 'index'])->name('blocks.index');
        Route::post('/users', [UserBlockController::class, 'store'])->name('blocks.store');
        Route::delete('/users/{blockedUserId}', [UserBlockController::class, 'destroy'])->name('blocks.destroy');
    });
});
