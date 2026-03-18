<?php

namespace App\Repositories;

use App\Models\AudioVersion;
use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AudioVersionRepository
{
    public function getVersionsByProject(int $projectId): Collection
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($projectId);

        return AudioVersion::where('project_id', $project->id)
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function uploadAudio(Project $project, array $data): AudioVersion
    {
        $data['project_id'] = $project->id;
        
        if (!isset($data['track_id'])) {
            $data['track_id'] = (string) \Illuminate\Support\Str::uuid();
            $data['is_active'] = true;
        }

        if (!isset($data['order'])) {
            $maxOrder = AudioVersion::where('project_id', $project->id)->max('order') ?? 0;
            $data['order'] = $maxOrder + 1;
        }

        return AudioVersion::create($data);
    }

    public function updateVersion(int $id, array $data): AudioVersion
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        $version->update($data);

        return $version->fresh();
    }

    public function deleteVersion(int $id): bool
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        return $version->delete();
    }

    public function reorderVersions(int $projectId, array $versionIds): void
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($projectId);

        DB::transaction(function () use ($projectId, $versionIds) {
            foreach ($versionIds as $index => $versionId) {
                AudioVersion::where('project_id', $projectId)
                    ->where('id', $versionId)
                    ->update(['order' => $index + 1]);
            }
        });
    }

    public function toggleMaster(int $id): AudioVersion
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        // Remove master status from all versions in the project
        AudioVersion::where('project_id', $version->project_id)
            ->update(['is_master' => false]);

        // Set this version as master
        $version->update(['is_master' => true]);

        return $version->fresh();
    }

    public function getVersionHistory(int $id): Collection
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        return AudioVersion::where('track_id', $version->track_id)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function setActiveVersion(int $id): AudioVersion
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', Auth::id());
        })->findOrFail($id);

        // Deactivate all versions in the same track group
        AudioVersion::where('track_id', $version->track_id)
            ->update(['is_active' => false]);

        // Set this version as active
        $version->update(['is_active' => true]);

        return $version->fresh();
    }
}
