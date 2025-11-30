<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminControllers\DashboardController;
use App\Http\Controllers\AdminControllers\UserController;


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

        // User Management Routes (Phase 12)
        Route::get('/users', [UserController::class, 'index'])->name('users.index');
        Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
        Route::get('/api/users', [UserController::class, 'list'])->name('users.list');

        // User Action Routes (Phase 12.2)
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

        // Child Account Management Routes (Phase 12.3)
        Route::get('/users/{id}/child-accounts', [UserController::class, 'childAccounts'])->name('users.childAccounts');
        Route::post('/users/{id}/child-accounts', [UserController::class, 'createChildAccount'])->name('users.createChildAccount');
        Route::put('/users/{parentId}/child-accounts/{childId}', [UserController::class, 'updateChildAccount'])->name('users.updateChildAccount');
        Route::delete('/users/{parentId}/child-accounts/{childId}', [UserController::class, 'deleteChildAccount'])->name('users.deleteChildAccount');
        Route::get('/api/users/{id}/family-tree', [UserController::class, 'familyTree'])->name('users.familyTree');

        // User Connections Management Routes (Phase 12.4)
        Route::get('/users/{id}/connections', [UserController::class, 'connections'])->name('users.connections');
        Route::delete('/users/{id}/connections/{connectionId}', [UserController::class, 'removeConnection'])->name('users.removeConnection');

        // Reports Management Routes (will be added in Phase 13)
        // Route::resource('reports', ReportController::class)->only(['index', 'show', 'update']);

        // Analytics Routes (will be added in Phase 14)
        // Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // Settings Routes (will be added in Phase 14)
        // Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    });

});
