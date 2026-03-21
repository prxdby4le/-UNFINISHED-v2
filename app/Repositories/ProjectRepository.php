<?php

namespace App\Repositories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class ProjectRepository
{
    public function getProjects(?string $search = null, int $perPage = 15)
    {
        $query = Project::where(function ($q) {
                $q->where('user_id', Auth::id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', Auth::id());
                  });
            })
            ->withCount('audioVersions')
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        return $query->paginate($perPage);
    }

    public function getProject(int $id): ?Project
    {
        return Project::where(function ($q) {
                $q->where('user_id', Auth::id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', Auth::id());
                  });
            })
            ->with(['audioVersions' => function ($query) {
                $query->orderBy('order', 'asc')->orderBy('created_at', 'asc');
            }, 'user'])
            ->findOrFail($id);
    }

    public function createProject(array $data): Project
    {
        $data['user_id'] = Auth::id();

        return Project::create($data);
    }

    public function updateProject(int $id, array $data): Project
    {
        $project = Project::where(function ($q) {
                $q->where('user_id', Auth::id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', Auth::id());
                  });
            })->findOrFail($id);
        $project->update($data);

        return $project->fresh();
    }

    public function deleteProject(int $id): bool
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($id);

        return $project->delete();
    }
}
