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
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    public function uploadAudio(Project $project, array $data): AudioVersion
    {
        $data['project_id'] = $project->id;
        
        // Set order to be the last in the project
        $maxOrder = AudioVersion::where('project_id', $project->id)->max('order') ?? 0;
        $data['order'] = $maxOrder + 1;

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
}
