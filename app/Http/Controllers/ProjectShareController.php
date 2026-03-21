<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\ProjectShare;
use App\Services\AudioService;
use App\Services\ColorExtractionService;
use App\Services\StorageService;
use App\Repositories\AudioVersionRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProjectShareController extends Controller
{
    public function __construct(
        private ColorExtractionService $colorService,
        private StorageService $storageService,
        private AudioService $audioService,
        private AudioVersionRepository $audioRepository,
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

        if ($share->permission === 'edit') {
            if (! Auth::check()) {
                return redirect()->guest(route('login'));
            }

            if ($project->user_id !== Auth::id()) {
                if (! $project->editors()->where('user_id', Auth::id())->exists()) {
                    $project->editors()->attach(Auth::id(), ['role' => 'editor']);
                }
            }

            return redirect()->route('projects.show', $project->id)
                ->with('success', 'Você ingressou no projeto como colaborador.');
        }

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

    public function uploadPage(string $token)
    {
        $share = $this->resolveEditShare($token);

        return Inertia::render('audio/SharedUpload', [
            'projectId' => $share->project_id,
            'token' => $token,
            'projectName' => $share->project->name,
        ]);
    }

    public function uploadStore(Request $request, string $token)
    {
        $share = $this->resolveEditShare($token);

        $request->validate([
            'files' => ['required', 'array'],
            'files.*' => ['required', 'file', 'mimes:wav,flac,mp3,aiff,m4a'],
        ]);

        $files = $request->file('files');
        $uploaded = 0;

        foreach ($files as $file) {
            if (! $file || ! $file->isValid()) {
                continue;
            }

            $metadata = $this->audioService->extractMetadata($file->getRealPath(), $file->getClientOriginalName());
            $filePath = $this->storageService->storeFile($file, 'audio/versions');

            $this->audioRepository->uploadAudio($share->project, [
                'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'original_filename' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'format' => $metadata['format'] ?? strtolower($file->getClientOriginalExtension()),
                'duration' => $metadata['duration'],
                'size' => $metadata['size'],
            ]);
            $uploaded++;
        }

        $message = $uploaded === 1
            ? 'Audio enviado com sucesso!'
            : "{$uploaded} audios enviados com sucesso!";

        return redirect()->back()->with('success', $message);
    }

    private function resolveEditShare(string $token): ProjectShare
    {
        $share = ProjectShare::where('token', $token)
            ->where('is_active', true)
            ->where('permission', 'edit')
            ->with('project')
            ->firstOrFail();

        if (! $share->isValid()) {
            abort($share->project->is_private ? 403 : 404);
        }

        return $share;
    }

    public function downloadSharedVersion(string $token, int $audioVersionId)
    {
        $share = ProjectShare::where('token', $token)
            ->where('is_active', true)
            ->with('project')
            ->firstOrFail();

        if (! $share->isValid()) {
            if ($share->project->is_private) {
                abort(403, 'This project is private.');
            }
            abort(404);
        }

        $version = \App\Models\AudioVersion::where('project_id', $share->project_id)
            ->findOrFail($audioVersionId);

        $filePath = storage_path('app/public/' . $version->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'Arquivo não encontrado');
        }

        $format = $version->format ?: pathinfo($filePath, PATHINFO_EXTENSION);
        $filename = $version->name . '.' . $format;

        return response()->download($filePath, $filename);
    }
}
