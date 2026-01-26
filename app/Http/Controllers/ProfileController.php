<?php

namespace App\Http\Controllers;

use App\Models\Profile;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function __construct(
        private StorageService $storageService
    ) {
    }

    public function show()
    {
        $user = auth()->user();
        $profile = $user->profile;

        return Inertia::render('profile/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'profile' => $profile ? [
                'id' => $profile->id,
                'full_name' => $profile->full_name,
                'avatar_path' => $profile->avatar_path,
            ] : null,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'full_name' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = auth()->user();
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

        return redirect()->back()->with('success', 'Perfil atualizado com sucesso!');
    }
}
