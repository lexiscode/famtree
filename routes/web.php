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
use App\Http\Controllers\GuestControllers\AuthAccessControllers\FeedController;
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
use App\Http\Controllers\GuestControllers\AuthAccessControllers\PrivateMessageController;
use App\Http\Controllers\GuestControllers\OnboardingController;
use App\Http\Controllers\GuestControllers\StatusController;
use App\Http\Controllers\GuestControllers\NotificationController;
use App\Http\Controllers\GuestControllers\SearchController;
use App\Http\Controllers\GuestControllers\AccountReactivationController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\DeceasedVerificationController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\MemorialController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\OrganizationController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ClassSetController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\ClassSetChatController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\GroupElectionController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\GroupRemovalController;
use Inertia\Inertia;



// Home / Landing Page - Conditional based on auth status
Route::get('/', function (Request $request) {
    if (auth()->check()) {
        // If the user is authenticated, show social feed
        return app(FeedController::class)->index($request);
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

// Account Reactivation routes (for memorialized users)
Route::middleware(['web'])->group(function () {
    Route::get('/reactivate/{token}', [AccountReactivationController::class, 'showReactivationForm'])->name('account.reactivate');
    Route::post('/reactivate/{token}', [AccountReactivationController::class, 'confirmReactivation'])->name('account.reactivate.confirm');
    Route::post('/request-reactivation', [AccountReactivationController::class, 'requestReactivation'])->name('account.request-reactivation');
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
        Route::post('/{connection}/divorce', [ConnectionRequestController::class, 'divorce'])->name('connections.divorce');
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

    // Profile routes
    // View own profile
    Route::get('/profile', [LandingPageController::class, 'index'])->name('profile');

    // View other users' profiles
    Route::get('/profile/{username}', [ProfileController::class, 'viewProfile'])->name('profile.view');

    // Family Tree routes (using UUID instead of ID)
    Route::prefix('family-tree')->group(function () {
        // List trees (updated to show admin trees)
        Route::get('/', [FamilyTreeController::class, 'index'])->name('family-tree.index');

        // Create/store with validation
        Route::get('/create', [FamilyTreeController::class, 'create'])->name('family-tree.create');
        Route::post('/', [FamilyTreeController::class, 'store'])->name('family-tree.store');

        // View tree (UUID route model binding)
        Route::get('/{familyTree}', [FamilyTreeController::class, 'show'])->name('family-tree.show');

        // View family group tree visualization
        Route::get('/{familyTree}/tree', [FamilyTreeController::class, 'viewTree'])->name('family-tree.tree');

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

        // Merged group name management (UUID route model binding)
        Route::post('/{familyTree}/merged-group-name', [FamilyTreeController::class, 'updateMergedGroupName'])->name('family-tree.update-merged-group-name');

        // Tree Chat routes (UUID route model binding)
        Route::get('/{familyTree}/chat/messages', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'getMessages'])->name('family-tree.chat.messages');
        Route::post('/{familyTree}/chat/send', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'sendMessage'])->name('family-tree.chat.send');
        Route::post('/{familyTree}/chat/typing', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'typing'])->name('family-tree.chat.typing');
        Route::post('/{familyTree}/chat/mark-read', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'markAsRead'])->name('family-tree.chat.mark-read');
        Route::put('/chat/message/{messageId}', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'editMessage'])->name('family-tree.chat.edit');
        Route::delete('/chat/message/{messageId}', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'deleteMessage'])->name('family-tree.chat.delete');
        Route::post('/chat/bulk-delete', [\App\Http\Controllers\GuestControllers\AuthAccessControllers\TreeChatController::class, 'bulkDeleteMessages'])->name('family-tree.chat.bulk-delete');
    });

    // Your Tree (Connection Tree Visualization) route
    Route::get('/your-tree', [ConnectionTreeController::class, 'index'])->name('your-tree.index');

    // View Another User's Tree route
    Route::get('/profile/{username}/tree', [ConnectionTreeController::class, 'viewUserTree'])->name('profile.tree');

    // API endpoint for getting tree data (for inline tree switching)
    Route::get('/api/tree/{userId}', [ConnectionTreeController::class, 'getTreeData'])->name('api.tree.data');

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
        Route::post('/{userUuid}/follow', [UserFollowController::class, 'follow'])->name('users.follow');
        Route::post('/{userUuid}/unfollow', [UserFollowController::class, 'unfollow'])->name('users.unfollow');
        Route::get('/{userUuid}/followers', [UserFollowController::class, 'followers'])->name('users.followers');
        Route::get('/{userUuid}/following', [UserFollowController::class, 'following'])->name('users.following');
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

    // Feed API routes for infinite scroll
    Route::prefix('api/feed')->group(function () {
        Route::get('/following', [FeedController::class, 'getFollowingPosts'])->name('api.feed.following');
        Route::get('/connections', [FeedController::class, 'getConnectionPosts'])->name('api.feed.connections');
        Route::get('/general', [FeedController::class, 'getGeneralPosts'])->name('api.feed.general');
        Route::get('/followers', [FeedController::class, 'getFollowersPosts'])->name('api.feed.followers');
        Route::get('/all', [FeedController::class, 'getAllPosts'])->name('api.feed.all');
        Route::get('/saved', [FeedController::class, 'getSavedPosts'])->name('api.feed.saved');
    });

    // Stories / Posts routes
    Route::prefix('stories')->group(function () {
        // Note: stories.index route removed - use "My Stories" tab in feed instead
        Route::post('/', [PostController::class, 'store'])->name('stories.store');
        Route::get('/search', [PostController::class, 'search'])->name('stories.search');
        Route::get('/filter', [PostController::class, 'filterByType'])->name('stories.filter');
        Route::get('/user/{userId}', [PostController::class, 'viewUser'])->name('stories.view-user');
        Route::get('/org/{orgPostId}', [FeedController::class, 'showOrgPost'])->name('stories.org.show');
        Route::get('/{postId}', [FeedController::class, 'showPost'])->name('stories.show');
        Route::put('/{postId}', [PostController::class, 'update'])->name('stories.update');
        Route::delete('/{postId}', [PostController::class, 'destroy'])->name('stories.destroy');

        // Comments
        Route::post('/{postId}/comments', [PostController::class, 'addComment'])->name('stories.comments.store');
        Route::delete('/comments/{commentId}', [PostController::class, 'deleteComment'])->name('stories.comments.destroy');
        Route::post('/comments/{commentId}/like', [PostController::class, 'toggleCommentLike'])->name('stories.comments.like');

        // Shareable comment thread
        Route::get('/comments/{uuid}', [PostController::class, 'showCommentThread'])->name('stories.comments.thread');

        // Reactions
        Route::post('/{postId}/reactions', [PostController::class, 'addReaction'])->name('stories.reactions.store');
        Route::delete('/{postId}/reactions', [PostController::class, 'removeReaction'])->name('stories.reactions.destroy');

        // Refam (reshare)
        Route::post('/{postId}/refam', [PostController::class, 'toggleRefam'])->name('stories.refam.toggle');
        Route::post('/org/{orgPostId}/refam', [PostController::class, 'toggleOrgRefam'])->name('stories.org.refam.toggle');

        // Save (bookmark)
        Route::post('/{postId}/save', [PostController::class, 'toggleSave'])->name('stories.save.toggle');
        Route::post('/org/{orgPostId}/save', [PostController::class, 'toggleOrgSave'])->name('stories.org.save.toggle');

        // Org Post Comments & Reactions (for users interacting with org posts in feed)
        Route::post('/org/{orgPostId}/comments', [PostController::class, 'addOrgComment'])->name('stories.org.comments.store');
        Route::delete('/org/comments/{commentId}', [PostController::class, 'deleteOrgComment'])->name('stories.org.comments.destroy');
        Route::post('/org/comments/{commentId}/like', [PostController::class, 'toggleOrgCommentLike'])->name('stories.org.comments.like');
        Route::post('/org/{orgPostId}/reactions', [PostController::class, 'addOrgReaction'])->name('stories.org.reactions.store');
        Route::delete('/org/{orgPostId}/reactions', [PostController::class, 'removeOrgReaction'])->name('stories.org.reactions.destroy');
    });

    // Settings routes
    Route::prefix('settings')->group(function () {
        Route::get('/account', function () {
            return Inertia::render('AuthAccessPages/Settings/AccountSettings');
        })->name('settings.account');

        Route::post('/account/change-password', [AccountSettingsController::class, 'changePassword'])->name('settings.change-password');
        Route::post('/account/change-email', [AccountSettingsController::class, 'changeEmail'])->name('settings.change-email');
        Route::post('/account/update-profile', [AccountSettingsController::class, 'updateProfile'])->name('settings.update-profile');
        Route::patch('/account/update-field', [AccountSettingsController::class, 'updateSingleField'])->name('settings.update-field');
        Route::post('/account/update-profile-image', [AccountSettingsController::class, 'updateProfileImage'])->name('settings.update-profile-image');
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

    // Private Messages routes
    Route::prefix('messages')->group(function () {
        Route::get('/', [PrivateMessageController::class, 'index'])->name('messages.index');
        Route::post('/mark-all-delivered', [PrivateMessageController::class, 'markAllAsDelivered'])->name('messages.mark-all-delivered');
        Route::post('/start', [PrivateMessageController::class, 'startConversation'])->name('messages.start');
        Route::get('/api/conversations', [PrivateMessageController::class, 'getConversations'])->name('messages.conversations');
        Route::get('/api/unread-count', [PrivateMessageController::class, 'getUnreadCount'])->name('messages.unread-count');
        Route::post('/bulk-delete', [PrivateMessageController::class, 'bulkDeleteMessages'])->name('messages.bulk-delete');
        Route::put('/message/{messageId}', [PrivateMessageController::class, 'editMessage'])->name('messages.edit');
        Route::delete('/message/{messageId}', [PrivateMessageController::class, 'deleteMessage'])->name('messages.delete');
        Route::get('/{conversationUuid}', [PrivateMessageController::class, 'show'])->name('messages.show');
        Route::get('/{conversationUuid}/messages', [PrivateMessageController::class, 'getMessages'])->name('messages.get-messages');
        Route::post('/{conversationUuid}/send', [PrivateMessageController::class, 'sendMessage'])->name('messages.send');
        Route::post('/{conversationUuid}/mark-read', [PrivateMessageController::class, 'markAsRead'])->name('messages.mark-read');
        Route::post('/{conversationUuid}/mark-delivered', [PrivateMessageController::class, 'markAsDelivered'])->name('messages.mark-delivered');
        Route::post('/{conversationUuid}/typing', [PrivateMessageController::class, 'typing'])->name('messages.typing');
    });

    // Status Check routes (for family members to respond to deceased verification)
    Route::prefix('status-check')->group(function () {
        Route::get('/{verificationUuid}', [DeceasedVerificationController::class, 'showFamilyCheckForm'])->name('status-check.show');
        Route::post('/{verificationUuid}', [DeceasedVerificationController::class, 'submitFamilyResponse'])->name('status-check.submit');
    });

    // Cancel pending status change (for the inactive user)
    Route::post('/cancel-status-change', [DeceasedVerificationController::class, 'cancelPendingChange'])->name('status-check.cancel');

    // Memorial Messages routes
    Route::prefix('memorial')->group(function () {
        Route::get('/{userUuid}/messages', [MemorialController::class, 'getMessages'])->name('memorial.messages');
        Route::post('/{userUuid}/messages', [MemorialController::class, 'addMessage'])->name('memorial.add-message');
        Route::put('/messages/{messageId}', [MemorialController::class, 'updateMessage'])->name('memorial.update-message');
        Route::delete('/messages/{messageId}', [MemorialController::class, 'deleteMessage'])->name('memorial.delete-message');
    });

    // Organization Groups routes
    Route::prefix('organizations')->group(function () {
        Route::get('/', [OrganizationController::class, 'index'])->name('organizations.index');
        Route::get('/{slug}', [OrganizationController::class, 'showOrganization'])->name('organizations.show');
        Route::get('/{organizationSlug}/faculties', [OrganizationController::class, 'faculties'])->name('organizations.faculties');
        Route::get('/{organizationSlug}/channels', [OrganizationController::class, 'channels'])->name('organizations.channels');
        Route::get('/faculty/{facultySlug}/departments', [OrganizationController::class, 'departments'])->name('organizations.departments');
        Route::get('/department/{departmentSlug}/class-sets', [OrganizationController::class, 'classSets'])->name('organizations.class-sets');
    });

    // Class Set Actions routes
    Route::prefix('class-sets')->group(function () {
        Route::post('/{classSetUuid}/join', [ClassSetController::class, 'join'])->name('class-sets.join');
        Route::post('/{classSetUuid}/leave', [ClassSetController::class, 'leave'])->name('class-sets.leave');
        Route::get('/{classSetUuid}/members', [ClassSetController::class, 'members'])->name('class-sets.members');
        Route::get('/{classSetUuid}/messages', [ClassSetChatController::class, 'getMessages'])->name('class-sets.messages');
        Route::post('/{classSetUuid}/messages', [ClassSetChatController::class, 'sendMessage'])->name('class-sets.send-message');
        Route::post('/{classSetUuid}/typing', [ClassSetChatController::class, 'typing'])->name('class-sets.typing');
        Route::put('/message/{messageId}', [ClassSetChatController::class, 'editMessage'])->name('class-sets.edit-message');
        Route::delete('/message/{messageId}', [ClassSetChatController::class, 'deleteMessage'])->name('class-sets.delete-message');
        Route::post('/bulk-delete', [ClassSetChatController::class, 'bulkDeleteMessages'])->name('class-sets.bulk-delete');

        // Group Election routes
        Route::get('/{classSetUuid}/election', [GroupElectionController::class, 'show'])->name('class-sets.election.show');
        Route::post('/{classSetUuid}/election/vote', [GroupElectionController::class, 'vote'])->name('class-sets.election.vote');

        // Group Removal routes
        Route::get('/{classSetUuid}/removal', [GroupRemovalController::class, 'show'])->name('class-sets.removal.show');
        Route::post('/{classSetUuid}/removal/initiate', [GroupRemovalController::class, 'initiate'])->name('class-sets.removal.initiate');
        Route::post('/{classSetUuid}/removal/vote', [GroupRemovalController::class, 'vote'])->name('class-sets.removal.vote');
    });
});
