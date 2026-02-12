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
use App\Http\Controllers\OrgControllers\GroupsController;
use App\Http\Controllers\OrgControllers\FollowersController;

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
    });

    // Authenticated Org Routes
    Route::middleware(['auth:org', 'orgAuth'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        // Logout
        Route::post('/logout', [OrgAuthController::class, 'logout'])->name('logout');

        // Posts
        Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
        Route::post('/posts', [PostController::class, 'store'])->name('posts.store');
        Route::put('/posts/{id}', [PostController::class, 'update'])->name('posts.update');
        Route::delete('/posts/{id}', [PostController::class, 'destroy'])->name('posts.destroy');
        Route::post('/posts/{id}/toggle-pin', [PostController::class, 'togglePin'])->name('posts.togglePin');

        // Broadcasts
        Route::get('/broadcasts', [BroadcastController::class, 'index'])->name('broadcasts.index');
        Route::get('/broadcasts/create', [BroadcastController::class, 'create'])->name('broadcasts.create');
        Route::post('/broadcasts', [BroadcastController::class, 'store'])->name('broadcasts.store');
        Route::get('/broadcasts/{id}', [BroadcastController::class, 'show'])->name('broadcasts.show');
        Route::post('/broadcasts/{id}/cancel', [BroadcastController::class, 'cancel'])->name('broadcasts.cancel');

        // Analytics
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // Profile
        Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
        Route::put('/profile', [ProfileController::class, 'update'])->name('profile.update');

        // Staff
        Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
        Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
        Route::put('/staff/{id}', [StaffController::class, 'update'])->name('staff.update');
        Route::delete('/staff/{id}', [StaffController::class, 'destroy'])->name('staff.destroy');

        // Groups
        Route::get('/groups', [GroupsController::class, 'index'])->name('groups.index');

        // Followers
        Route::get('/followers', [FollowersController::class, 'index'])->name('followers.index');
    });
});
