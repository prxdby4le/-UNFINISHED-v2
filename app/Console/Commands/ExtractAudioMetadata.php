<?php

namespace App\Console\Commands;

use App\Models\AudioVersion;
use App\Services\AudioService;
use Illuminate\Console\Command;

class ExtractAudioMetadata extends Command
{
    protected $signature = 'audio:extract-metadata {--project= : Only process versions from this project ID}';

    protected $description = 'Re-extract duration and format for audio versions that have null duration';

    public function handle(AudioService $audioService): int
    {
        $query = AudioVersion::whereNull('duration')->orWhere('duration', 0);

        if ($projectId = $this->option('project')) {
            $query->where('project_id', $projectId);
        }

        $versions = $query->get();
        $this->info("Found {$versions->count()} audio versions to process.");

        $updated = 0;
        foreach ($versions as $version) {
            $path = storage_path('app/public/'.$version->file_path);
            if (! file_exists($path)) {
                $this->warn("File not found: {$version->file_path}");
                continue;
            }

            $metadata = $audioService->extractMetadata($path);
            if ($metadata['duration'] !== null) {
                $version->update([
                    'duration' => $metadata['duration'],
                    'format' => $metadata['format'] ?? $version->format,
                ]);
                $updated++;
                $this->line("Updated: {$version->name} — {$metadata['duration']}s");
            }
        }

        $this->info("Updated {$updated} audio versions.");
        return 0;
    }
}
