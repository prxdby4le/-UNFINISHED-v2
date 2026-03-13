<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectShare;
use App\Services\ColorExtractionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectShareController extends Controller
{
    public function __construct(
        private ColorExtractionService $colorService,
    ) {}

    public function index(int $projectId)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($projectId);

        return response()->json([
            'shares' => $project->activeShares()->orderByDesc('created_at')->get(),
            'is_private' => $project->is_private,
        ]);
    }

    public function store(Request $request, int $projectId)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($projectId);

        $request->validate([
            'permission' => ['required', 'in:view,edit'],
        ]);

        $share = $project->shares()->create([
            'permission' => $request->input('permission'),
            'created_by' => Auth::id(),
        ]);

        return response()->json([
            'share' => $share,
            'url' => url("/share/{$share->token}"),
        ]);
    }

    public function destroy(int $shareId)
    {
        $share = ProjectShare::whereHas('project', function ($q) {
            $q->where('user_id', Auth::id());
        })->findOrFail($shareId);

        $share->update(['is_active' => false]);

        return response()->json(['success' => true]);
    }

    public function togglePrivacy(int $projectId)
    {
        $project = Project::where('user_id', Auth::id())->findOrFail($projectId);
        $project->update(['is_private' => ! $project->is_private]);

        return response()->json([
            'is_private' => $project->is_private,
        ]);
    }

    public function showPublic(string $token)
    {
        $share = ProjectShare::where('token', $token)
            ->where('is_active', true)
            ->with(['project.audioVersions', 'project.user'])
            ->firstOrFail();

        if (! $share->isValid()) {
            if ($share->project->is_private) {
                abort(403, 'This project is private.');
            }
            abort(404);
        }

        $project = $share->project;

        $colors = null;
        if ($project->cover_path) {
            $fullPath = storage_path('app/public/' . $project->cover_path);
            if (file_exists($fullPath)) {
                $colors = $this->colorService->extractColors($fullPath);
            }
        }

        $project->audioVersions->each(function ($version) use ($project) {
            $version->project_info = [
                'id' => $project->id,
                'name' => $project->name,
                'cover_path' => $project->cover_path,
            ];
        });

        return Inertia::render('projects/SharedView', [
            'project' => $project,
            'permission' => $share->permission,
            'colors' => $colors,
            'token' => $token,
        ]);
    }
}
