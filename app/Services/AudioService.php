<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Log;

class AudioService
{
    private ?\getID3 $getid3 = null;

    /**
     * Extract metadata from audio file
     *
     * @param  string  $filePath
     * @return array{format: string, duration: int|null, size: int}
     */
    public function extractMetadata(string $filePath, string $originalFilename = ''): array
    {
        $extension = strtolower(pathinfo($originalFilename ?: $filePath, PATHINFO_EXTENSION));
        $size = filesize($filePath);

        // Get duration and format using getid3
        $metadata = $this->getMetadata($filePath, $originalFilename);
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
    private function getMetadata(string $filePath, string $originalFilename = ''): array
    {
        try {
            if (!file_exists($filePath)) {
                return ['format' => null, 'duration' => null];
            }

            if ($this->getid3 === null) {
                if (!class_exists('getID3', false)) {
                    require_once base_path('vendor/james-heinrich/getid3/getid3/getid3.php');
                }
                $this->getid3 = new \getID3();
            }

            $fileInfo = $this->getid3->analyze($filePath, filesize($filePath), $originalFilename);

            // Check for errors
            if (isset($fileInfo['error'])) {
                Log::warning('getID3 error analyzing file', [
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

            $result = [
                'format' => $format ?: strtolower(pathinfo($filePath, PATHINFO_EXTENSION)),
                'duration' => $duration > 0 ? $duration : null,
            ];

            // Fallback: read WAV/RIFF header manually when getID3 fails
            if ($result['duration'] === null && file_exists($filePath)) {
                $wavDuration = $this->readWavDuration($filePath);
                if ($wavDuration > 0) {
                    $result['duration'] = (int) round($wavDuration);
                }
            }

            return $result;
        } catch (Exception $e) {
            Log::error('Error extracting audio metadata', [
                'file' => $filePath,
                'error' => $e->getMessage(),
            ]);
            $fallback = ['format' => strtolower(pathinfo($filePath, PATHINFO_EXTENSION)), 'duration' => null];
            $wavDuration = $this->readWavDuration($filePath);
            if ($wavDuration > 0) {
                $fallback['duration'] = (int) round($wavDuration);
            }
            return $fallback;
        }
    }

    /**
     * Read WAV/RIFF file duration from header (fallback when getID3 fails)
     */
    private function readWavDuration(string $filePath): float
    {
        if (! $filePath || ! file_exists($filePath)) {
            return 0;
        }
        try {
            $fp = @fopen($filePath, 'rb');
            if (! $fp || fread($fp, 4) !== 'RIFF') {
                return 0;
            }
            fread($fp, 4);
            if (fread($fp, 4) !== 'WAVE') {
                fclose($fp);
                return 0;
            }
            $byteRate = 0;
            $dataSize = 0;
            while (! feof($fp)) {
                $chunkId = fread($fp, 4);
                $chunkData = fread($fp, 4);
                $chunkSize = strlen($chunkData) === 4 ? unpack('V', $chunkData)[1] : 0;
                if ($chunkId === 'fmt ') {
                    $fmt = fread($fp, min(16, $chunkSize));
                    if (strlen($fmt) >= 12) {
                        $byteRate = unpack('V', substr($fmt, 8, 4))[1] ?? 0;
                    }
                    if ($chunkSize > 16) {
                        fseek($fp, $chunkSize - 16, SEEK_CUR);
                    }
                } elseif ($chunkId === 'data') {
                    $dataSize = $chunkSize;
                    break;
                } else {
                    fseek($fp, $chunkSize, SEEK_CUR);
                }
            }
            fclose($fp);
            if ($dataSize <= 0 || $byteRate <= 0) {
                return 0;
            }

            return $dataSize / $byteRate;
        } catch (\Throwable) {
            return 0;
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
