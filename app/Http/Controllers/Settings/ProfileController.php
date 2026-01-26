<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Profile;
use App\Services\StorageService;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __construct(
        private StorageService $storageService
    ) {
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $profile = $user->profile;

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $profile ? [
                'id' => $profile->id,
                'full_name' => $profile->full_name,
                'avatar_path' => $profile->avatar_path,
            ] : null,
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $user->fill($request->validated());

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        // Handle profile (avatar and full_name)
        $profile = $user->profile ?? new Profile(['user_id' => $user->id]);

        if ($request->has('full_name')) {
            $profile->full_name = $request->input('full_name');
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($profile->avatar_path) {
                $this->storageService->deleteFile($profile->avatar_path);
            }
            $avatarPath = $this->storageService->storeFile($request->file('avatar'), 'profiles/avatars');
            $profile->avatar_path = $avatarPath;
        }

        $profile->save();

        return to_route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's profile.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
