<?php

namespace App\Services;

use Exception;

class AudioService
{
    private ?\getID3 $getid3 = null;

    /**
     * Extract metadata from audio file
     *
     * @param  string  $filePath
     * @return array{format: string, duration: int|null, size: int}
     */
    public function extractMetadata(string $filePath): array
    {
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        $size = filesize($filePath);

        // Get duration and format using getid3
        $metadata = $this->getMetadata($filePath);
        $duration = $metadata['duration'] ?? null;
        $format = $metadata['format'] ?? $extension;

        return [
            'format' => $format,
            'duration' => $duration,
            'size' => $size,
        ];
    }

    /**
     * Get metadata from audio file using getID3
     *
     * @param  string  $filePath
     * @return array{format: string|null, duration: int|null}
     */
    private function getMetadata(string $filePath): array
    {
        try {
            if (!file_exists($filePath)) {
                return ['format' => null, 'duration' => null];
            }

            if ($this->getid3 === null) {
                $this->getid3 = new \getID3();
            }

            $fileInfo = $this->getid3->analyze($filePath);

            // Check for errors
            if (isset($fileInfo['error'])) {
                \Log::warning('getID3 error analyzing file', [
                    'file' => $filePath,
                    'errors' => $fileInfo['error'],
                ]);
                return ['format' => null, 'duration' => null];
            }

            // Get format
            $format = null;
            if (isset($fileInfo['fileformat'])) {
                $format = strtolower($fileInfo['fileformat']);
            } elseif (isset($fileInfo['audio']['dataformat'])) {
                $format = strtolower($fileInfo['audio']['dataformat']);
            }

            // Get duration
            $duration = null;
            if (isset($fileInfo['playtime_seconds'])) {
                $duration = (int) round($fileInfo['playtime_seconds']);
            } elseif (isset($fileInfo['audio']['playtime_seconds'])) {
                $duration = (int) round($fileInfo['audio']['playtime_seconds']);
            } elseif (isset($fileInfo['video']['playtime_seconds'])) {
                $duration = (int) round($fileInfo['video']['playtime_seconds']);
            }

            return [
                'format' => $format,
                'duration' => $duration > 0 ? $duration : null,
            ];
        } catch (Exception $e) {
            \Log::error('Error extracting audio metadata', [
                'file' => $filePath,
                'error' => $e->getMessage(),
            ]);
            return ['format' => null, 'duration' => null];
        }
    }


    /**
     * Validate audio file format
     *
     * @param  string  $mimeType
     * @param  string  $extension
     * @return bool
     */
    public function isValidFormat(string $mimeType, string $extension): bool
    {
        $allowedFormats = ['wav', 'flac', 'mp3', 'aiff', 'm4a'];
        $allowedMimeTypes = [
            'audio/wav',
            'audio/wave',
            'audio/x-wav',
            'audio/flac',
            'audio/x-flac',
            'audio/mpeg',
            'audio/mp3',
            'audio/aiff',
            'audio/x-aiff',
            'audio/mp4',
            'audio/x-m4a',
        ];

        $ext = strtolower($extension);

        return in_array($ext, $allowedFormats) || in_array($mimeType, $allowedMimeTypes);
    }
}
