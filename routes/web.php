<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\GuestControllers\AuthController;
use App\Http\Controllers\GuestControllers\BlogController;
use App\Http\Controllers\GuestControllers\HomeController;
use App\Http\Controllers\GuestControllers\AboutController;
use App\Http\Controllers\GuestControllers\ContactController;
use App\Http\Controllers\GuestControllers\FeaturesController;
use App\Http\Controllers\GuestControllers\HowItWorksController;
use App\Http\Controllers\GuestControllers\FamilyPreviewController;
use App\Http\Controllers\GuestControllers\FamilyExplorerController;
use App\Http\Controllers\GuestControllers\AuthAccessControllers\LandingPageController;
use App\Http\Controllers\GuestControllers\OnboardingController;



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
});


/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware(['web', 'auth'])->group(function () {
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

    // Onboarding routes
    Route::prefix('onboarding')->group(function () {
        Route::get('/', [OnboardingController::class, 'show'])->name('onboarding.show');
        Route::post('/basic-info', [OnboardingController::class, 'saveBasicInfo'])->name('onboarding.save.basic-info');
        Route::post('/family-status', [OnboardingController::class, 'saveFamilyStatus'])->name('onboarding.save.family-status');
        Route::post('/location-info', [OnboardingController::class, 'saveLocationInfo'])->name('onboarding.save.location-info');
        Route::post('/education-work', [OnboardingController::class, 'saveEducationWork'])->name('onboarding.save.education-work');
        Route::post('/siblings-search', [OnboardingController::class, 'saveSiblingsSearch'])->name('onboarding.save.siblings-search');
        Route::post('/complete', [OnboardingController::class, 'complete'])->name('onboarding.complete');
    });
});
