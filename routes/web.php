<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('home');
})->name('home');

Route::get('dashboard', function () {
    return redirect()->route('projects.index');
})->middleware(['auth', 'verified'])->name('dashboard');

// Public share routes (no auth)
Route::get('/share/{token}', [\App\Http\Controllers\ProjectShareController::class, 'showPublic'])->name('share.show');
Route::get('/share/{token}/upload', [\App\Http\Controllers\ProjectShareController::class, 'uploadPage'])->name('share.upload');
Route::post('/share/{token}/upload', [\App\Http\Controllers\ProjectShareController::class, 'uploadStore'])->name('share.upload.store');

// Projects routes
Route::middleware(['auth'])->group(function () {
    Route::resource('projects', \App\Http\Controllers\ProjectController::class);

    // Project sharing routes
    Route::get('projects/{projectId}/shares', [\App\Http\Controllers\ProjectShareController::class, 'index'])->name('shares.index');
    Route::post('projects/{projectId}/shares', [\App\Http\Controllers\ProjectShareController::class, 'store'])->name('shares.store');
    Route::delete('shares/{shareId}', [\App\Http\Controllers\ProjectShareController::class, 'destroy'])->name('shares.destroy');
    Route::post('projects/{projectId}/toggle-privacy', [\App\Http\Controllers\ProjectShareController::class, 'togglePrivacy'])->name('projects.toggle-privacy');

    // Audio versions routes
    Route::get('projects/{projectId}/upload', function (int $projectId) {
        return \Inertia\Inertia::render('audio/Upload', ['projectId' => $projectId]);
    })->name('audio.upload');
    Route::post('projects/{projectId}/audio-versions', [\App\Http\Controllers\AudioVersionController::class, 'store'])->name('audio-versions.store');
    Route::put('audio-versions/{id}', [\App\Http\Controllers\AudioVersionController::class, 'update'])->name('audio-versions.update');
    Route::delete('audio-versions/{id}', [\App\Http\Controllers\AudioVersionController::class, 'destroy'])->name('audio-versions.destroy');
    Route::post('projects/{projectId}/audio-versions/reorder', [\App\Http\Controllers\AudioVersionController::class, 'reorder'])->name('audio-versions.reorder');
    Route::post('audio-versions/{id}/toggle-master', [\App\Http\Controllers\AudioVersionController::class, 'toggleMaster'])->name('audio-versions.toggle-master');
    
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
});

require __DIR__.'/settings.php';
