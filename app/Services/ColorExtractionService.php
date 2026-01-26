<?php

namespace App\Services;

use Exception;

class ColorExtractionService
{
    /**
     * Extract dominant colors from image
     *
     * @param  string  $imagePath
     * @return array{primary: string, secondary: string, accent: string}
     */
    public function extractColors(string $imagePath): array
    {
        try {
            if (!file_exists($imagePath) || !function_exists('imagecreatefromstring')) {
                return $this->getDefaultColors();
            }

            // Get image info
            $imageInfo = getimagesize($imagePath);
            if ($imageInfo === false) {
                return $this->getDefaultColors();
            }

            [$width, $height, $type] = $imageInfo;

            // Check if image type is supported
            if (!in_array($type, [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_GIF, IMAGETYPE_WEBP], true)) {
                return $this->getDefaultColors();
            }

            // Validate dimensions
            if ($width <= 0 || $height <= 0) {
                return $this->getDefaultColors();
            }

            // Resize for faster processing (max 200px)
            $maxSize = 200;
            if ($width > $maxSize || $height > $maxSize) {
                $ratio = min($maxSize / $width, $maxSize / $height);
                $newWidth = (int) ($width * $ratio);
                $newHeight = (int) ($height * $ratio);
            } else {
                $newWidth = $width;
                $newHeight = $height;
            }

            // Create image resource based on type
            // Use global namespace for GD functions and check if they exist
            $source = null;
            if ($type === IMAGETYPE_JPEG && function_exists('imagecreatefromjpeg')) {
                $source = \imagecreatefromjpeg($imagePath);
            } elseif ($type === IMAGETYPE_PNG && function_exists('imagecreatefrompng')) {
                $source = \imagecreatefrompng($imagePath);
            } elseif ($type === IMAGETYPE_GIF && function_exists('imagecreatefromgif')) {
                $source = \imagecreatefromgif($imagePath);
            } elseif ($type === IMAGETYPE_WEBP && function_exists('imagecreatefromwebp')) {
                $source = \imagecreatefromwebp($imagePath);
            }

            // Check if image was created successfully (can be false or null)
            // In PHP 8.4+, imagecreatefrom* returns \GdImage, in older versions it returns resource
            if ($source === false || $source === null) {
                return $this->getDefaultColors();
            }

            // Resize if needed
            if ($newWidth !== $width || $newHeight !== $height) {
                $resized = \imagecreatetruecolor($newWidth, $newHeight);
                if ($resized === false || $resized === null) {
                    \imagedestroy($source);
                    return $this->getDefaultColors();
                }
                \imagecopyresampled($resized, $source, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                \imagedestroy($source);
                $source = $resized;
            }

            // Get dominant colors
            $colors = $this->getDominantColors($source, $newWidth, $newHeight);
            \imagedestroy($source);

            return [
                'primary' => $colors[0] ?? '#000000',
                'secondary' => $colors[1] ?? '#ffffff',
                'accent' => $colors[2] ?? '#888888',
            ];
        } catch (Exception $e) {
            return $this->getDefaultColors();
        }
    }

    /**
     * Get dominant colors from image resource
     *
     * @param  resource|\GdImage  $image
     * @param  int  $width
     * @param  int  $height
     * @return array<string>
     */
    private function getDominantColors($image, int $width, int $height): array
    {
        $colorCounts = [];

        // Sample every 10th pixel for performance
        for ($x = 0; $x < $width; $x += 10) {
            for ($y = 0; $y < $height; $y += 10) {
                $rgb = \imagecolorat($image, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $hex = sprintf('#%02x%02x%02x', $r, $g, $b);
                $colorCounts[$hex] = ($colorCounts[$hex] ?? 0) + 1;
            }
        }

        // Sort by frequency and get top 3
        arsort($colorCounts);
        $colors = array_slice(array_keys($colorCounts), 0, 3);

        return $colors;
    }

    /**
     * Get default colors
     *
     * @return array{primary: string, secondary: string, accent: string}
     */
    private function getDefaultColors(): array
    {
        return [
            'primary' => '#000000',
            'secondary' => '#ffffff',
            'accent' => '#888888',
        ];
    }
}
