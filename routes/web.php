<?php

use Illuminate\Support\Facades\Route;

Route::get('/', [\App\Http\Controllers\PageController::class, 'home'])->name('home');
Route::get('dashboard', [\App\Http\Controllers\PageController::class, 'dashboard'])->middleware(['auth', 'verified'])->name('dashboard');

// Google Auth
Route::get('/auth/google', [\App\Http\Controllers\Auth\GoogleSocialiteController::class, 'redirectToGoogle'])->name('login.google');
Route::get('/auth/google/callback', [\App\Http\Controllers\Auth\GoogleSocialiteController::class, 'handleCallback']);

// Public share routes (no auth)
Route::get('/share/{token}', [\App\Http\Controllers\ProjectShareController::class, 'showPublic'])->name('share.show');
Route::get('/share/{token}/upload', [\App\Http\Controllers\ProjectShareController::class, 'uploadPage'])->name('share.upload');
Route::post('/share/{token}/upload', [\App\Http\Controllers\ProjectShareController::class, 'uploadStore'])->name('share.upload.store');
Route::get('/share/{token}/download/{audioVersionId}', [\App\Http\Controllers\ProjectShareController::class, 'downloadSharedVersion'])->name('share.download');

// Projects routes
Route::middleware(['auth'])->group(function () {
    Route::resource('projects', \App\Http\Controllers\ProjectController::class);

    // Project sharing routes
    Route::get('projects/{projectId}/shares', [\App\Http\Controllers\ProjectShareController::class, 'index'])->name('shares.index');
    Route::post('projects/{projectId}/shares', [\App\Http\Controllers\ProjectShareController::class, 'store'])->name('shares.store');
    Route::delete('shares/{shareId}', [\App\Http\Controllers\ProjectShareController::class, 'destroy'])->name('shares.destroy');
    Route::post('projects/{projectId}/toggle-privacy', [\App\Http\Controllers\ProjectShareController::class, 'togglePrivacy'])->name('projects.toggle-privacy');

    // Audio versions routes
    Route::get('projects/{projectId}/upload', [\App\Http\Controllers\AudioVersionController::class, 'uploadPage'])->name('audio.upload');
    Route::post('projects/{projectId}/audio-versions', [\App\Http\Controllers\AudioVersionController::class, 'store'])->name('audio-versions.store');
    Route::put('audio-versions/{id}', [\App\Http\Controllers\AudioVersionController::class, 'update'])->name('audio-versions.update');
    Route::delete('audio-versions/{id}', [\App\Http\Controllers\AudioVersionController::class, 'destroy'])->name('audio-versions.destroy');
    Route::delete('audio-versions/{id}/history', [\App\Http\Controllers\AudioVersionController::class, 'destroyHistory'])->name('audio-versions.destroy-history');
    Route::post('projects/{projectId}/audio-versions/reorder', [\App\Http\Controllers\AudioVersionController::class, 'reorder'])->name('audio-versions.reorder');
    Route::post('audio-versions/{id}/toggle-master', [\App\Http\Controllers\AudioVersionController::class, 'toggleMaster'])->name('audio-versions.toggle-master');
    Route::get('audio-versions/{id}/history', [\App\Http\Controllers\AudioVersionController::class, 'history'])->name('audio-versions.history');
    Route::post('audio-versions/{id}/new-version', [\App\Http\Controllers\AudioVersionController::class, 'newVersion'])->name('audio-versions.new-version');
    Route::put('audio-versions/{id}/set-active', [\App\Http\Controllers\AudioVersionController::class, 'setActive'])->name('audio-versions.set-active');
    
    // Feedback routes
    Route::get('audio-versions/{audioVersionId}/feedback', [\App\Http\Controllers\FeedbackController::class, 'index'])->name('feedback.index');
    Route::get('projects/{projectId}/audio-versions/{audioVersionId}/feedback', [\App\Http\Controllers\FeedbackController::class, 'index'])->name('feedback.show');
    Route::post('audio-versions/{audioVersionId}/feedback', [\App\Http\Controllers\FeedbackController::class, 'store'])->name('feedback.store');
    Route::put('feedback/{id}', [\App\Http\Controllers\FeedbackController::class, 'update'])->name('feedback.update');
    Route::delete('feedback/{id}', [\App\Http\Controllers\FeedbackController::class, 'destroy'])->name('feedback.destroy');
    
    // Profile routes
    Route::get('profile', [\App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::put('profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.basic.update');
    
    // Download routes
    Route::get('audio-versions/{id}/download', [\App\Http\Controllers\DownloadController::class, 'downloadVersion'])->name('audio-versions.download');
    Route::get('projects/{projectId}/download', [\App\Http\Controllers\DownloadController::class, 'downloadProject'])->name('projects.download');

    // Support routes
    Route::get('support/pix', function () {
        return inertia('support/pix');
    })->name('support.pix');
});

require __DIR__.'/settings.php';
