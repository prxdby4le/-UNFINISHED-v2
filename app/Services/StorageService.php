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
        $disk = config('filesystems.default');
        return $file->store($directory, $disk);
    }

    /**
     * Delete file from storage
     *
     * @param  string  $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        $disk = config('filesystems.default');
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->delete($path);
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
        $disk = config('filesystems.default');
        return Storage::disk($disk)->url($path);
    }

    /**
     * Get file contents
     *
     * @param  string  $path
     * @return string|null
     */
    public function getFileContents(string $path): ?string
    {
        $disk = config('filesystems.default');
        if (Storage::disk($disk)->exists($path)) {
            return Storage::disk($disk)->get($path);
        }

        return null;
    }
}
