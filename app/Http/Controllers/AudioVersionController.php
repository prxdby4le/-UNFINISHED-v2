<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAudioVersionRequest;
use App\Http\Requests\UpdateAudioVersionRequest;
use App\Repositories\AudioVersionRepository;
use App\Services\AudioService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AudioVersionController extends Controller
{
    public function __construct(
        private AudioVersionRepository $repository,
        private StorageService $storageService,
        private AudioService $audioService
    ) {
    }

    public function index(int $projectId)
    {
        $versions = $this->repository->getVersionsByProject($projectId);

        return Inertia::render('audio/Index', [
            'projectId' => $projectId,
            'versions' => $versions,
        ]);
    }

    public function store(StoreAudioVersionRequest $request, int $projectId)
    {
        $file = $request->file('file');
        $metadata = $this->audioService->extractMetadata($file->getRealPath());

        // Store file
        $filePath = $this->storageService->storeFile($file, 'audio/versions');

        // Create version
        $data = [
            'name' => $request->input('name') ?? pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
            'file_path' => $filePath,
            'format' => $metadata['format'],
            'duration' => $metadata['duration'],
            'size' => $metadata['size'],
        ];

        $version = $this->repository->uploadAudio($projectId, $data);

        return redirect()->back()->with('success', 'Áudio enviado com sucesso!');
    }

    public function update(UpdateAudioVersionRequest $request, int $id)
    {
        $data = $request->validated();
        $version = $this->repository->updateVersion($id, $data);

        return redirect()->back()->with('success', 'Versão atualizada com sucesso!');
    }

    public function destroy(int $id)
    {
        // Get version to delete file before deleting from database
        $version = \App\Models\AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', auth()->id());
        })->findOrFail($id);

        // Delete file if exists
        if ($version->file_path) {
            $this->storageService->deleteFile($version->file_path);
        }

        $this->repository->deleteVersion($id);

        return redirect()->back()->with('success', 'Versão deletada com sucesso!');
    }

    public function reorder(Request $request, int $projectId)
    {
        $request->validate([
            'version_ids' => ['required', 'array'],
            'version_ids.*' => ['required', 'integer'],
        ]);

        $this->repository->reorderVersions($projectId, $request->input('version_ids'));

        return redirect()->back()->with('success', 'Ordem atualizada com sucesso!');
    }

    public function toggleMaster(int $id)
    {
        $version = $this->repository->toggleMaster($id);

        return redirect()->back()->with('success', 'Versão master atualizada!');
    }
}
