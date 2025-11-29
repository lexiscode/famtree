<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AdminControllers\AdminAuthController;
use Inertia\Inertia;


Route::group(['prefix' => 'admin', 'as' => 'admin.', 'middleware' => ['web']], function () {

    // Guest Routes (Accessible without login)
    Route::middleware('guest:admin')->group(function () {
        Route::get('/login', [AdminAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [AdminAuthController::class, 'login']);
        Route::get('/forgot-password', [AdminAuthController::class, 'showForgotPassword'])->name('forgot-password');
        Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword'])->name('send-password-reset');
        Route::get('/reset-password', [AdminAuthController::class, 'showResetPassword'])->name('show-reset-password');
        Route::post('/reset-password', [AdminAuthController::class, 'resetPassword'])->name('reset-password');
    });

    // Authenticated Admin Routes (Requires 'auth:admin' middleware)
    Route::middleware('auth:admin')->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
        Route::get('/dashboard', function () {
            return Inertia::render('AdminPages/Dashboard/Index');
        })->name('dashboard');
    });

});
