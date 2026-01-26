<?php

namespace App\Repositories;

use App\Models\Library;
use Illuminate\Support\Facades\Auth;

class LibraryRepository
{
    public function isInLibrary(int $audioVersionId): bool
    {
        return Library::where('user_id', Auth::id())
            ->where('audio_version_id', $audioVersionId)
            ->exists();
    }

    public function addToLibrary(int $audioVersionId): Library
    {
        return Library::firstOrCreate([
            'user_id' => Auth::id(),
            'audio_version_id' => $audioVersionId,
        ]);
    }

    public function removeFromLibrary(int $audioVersionId): bool
    {
        return Library::where('user_id', Auth::id())
            ->where('audio_version_id', $audioVersionId)
            ->delete();
    }

    public function toggleLibrary(int $audioVersionId): bool
    {
        if ($this->isInLibrary($audioVersionId)) {
            return $this->removeFromLibrary($audioVersionId);
        }

        $this->addToLibrary($audioVersionId);

        return true;
    }
}
