<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class StorageService
{
    /**
     * Store uploaded file
     *
     * @param  UploadedFile  $file
     * @param  string  $directory
     * @return string
     */
    public function storeFile(UploadedFile $file, string $directory = 'uploads'): string
    {
        return $file->store($directory, 'public');
    }

    /**
     * Delete file from storage
     *
     * @param  string  $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }

    /**
     * Get file URL
     *
     * @param  string  $path
     * @return string
     */
    public function getFileUrl(string $path): string
    {
        return Storage::disk('public')->url($path);
    }

    /**
     * Get file contents
     *
     * @param  string  $path
     * @return string|null
     */
    public function getFileContents(string $path): ?string
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->get($path);
        }

        return null;
    }
}
