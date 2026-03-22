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

    public function uploadPage(int $projectId)
    {
        return Inertia::render('audio/Upload', [
            'projectId' => $projectId,
        ]);
    }

    public function store(StoreAudioVersionRequest $request, int $projectId)
    {
        $files = $request->file('files') ?? [$request->file('file')];
        $files = array_filter($files);

        if (empty($files)) {
            return redirect()->back()->with('error', 'Nenhum arquivo enviado.');
        }

        $project = \App\Models\Project::where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', auth()->id());
                  });
            })->findOrFail($projectId);
        $uploaded = 0;
        foreach ($files as $file) {
            if (!$file || !$file->isValid()) {
                continue;
            }

            $metadata = $this->audioService->extractMetadata($file->getRealPath(), $file->getClientOriginalName());
            $filePath = $this->storageService->storeFile($file, 'audio/versions');

            $data = [
                'name' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME),
                'original_filename' => $file->getClientOriginalName(),
                'file_path' => $filePath,
                'format' => $metadata['format'] ?? strtolower($file->getClientOriginalExtension()),
                'duration' => $metadata['duration'],
                'size' => $metadata['size'],
            ];

            $this->repository->uploadAudio($project, $data);
            $uploaded++;
        }

        $message = $uploaded === 1
            ? 'Áudio enviado com sucesso!'
            : "{$uploaded} áudios enviados com sucesso!";

        return redirect()->back()->with('success', $message);
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

        $versions = \App\Models\AudioVersion::where('track_id', $version->track_id)->get();

        foreach ($versions as $v) {
            if ($v->file_path) {
                $this->storageService->deleteFile($v->file_path);
            }
            $v->delete();
        }

        return redirect()->back()->with('success', 'Faixa e seu histórico foram deletados!');
    }

    public function destroyHistory(int $id)
    {
        $version = \App\Models\AudioVersion::whereHas('project', function ($query) {
            $query->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', auth()->id());
                  });
            });
        })->findOrFail($id);

        if ($version->is_active) {
            return redirect()->back()->with('error', 'Não é possível deletar a versão ativa.');
        }

        if ($version->file_path) {
            $this->storageService->deleteFile($version->file_path);
        }

        $version->delete();

        return redirect()->back()->with('success', 'Versão removida do histórico!');
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

    public function history(int $id)
    {
        $history = $this->repository->getVersionHistory($id);
        return response()->json($history);
    }

    public function newVersion(Request $request, int $id)
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:wav,flac,mp3,aiff,m4a'],
        ]);

        $parentVersion = \App\Models\AudioVersion::whereHas('project', function ($query) {
            $query->where(function ($q) {
                $q->where('user_id', auth()->id())
                  ->orWhereHas('editors', function ($q2) {
                      $q2->where('user_id', auth()->id());
                  });
            });
        })->findOrFail($id);

        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return redirect()->back()->with('error', 'Arquivo inválido.');
        }

        $metadata = $this->audioService->extractMetadata($file->getRealPath(), $file->getClientOriginalName());
        $filePath = $this->storageService->storeFile($file, 'audio/versions');

        if (!$filePath) {
            throw new \Exception("Falha ao salvar o arquivo. getErrorMessage: " . $file->getErrorMessage() . " Extension: " . $file->extension());
        }

        $data = [
            'track_id' => $parentVersion->track_id,
            'order' => $parentVersion->order,
            'is_active' => true,
            'name' => $parentVersion->name,
            'original_filename' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'format' => $metadata['format'] ?? strtolower($file->getClientOriginalExtension()),
            'duration' => $metadata['duration'],
            'size' => $metadata['size'],
        ];

        \App\Models\AudioVersion::where('track_id', $parentVersion->track_id)
            ->update(['is_active' => false]);

        $project = \App\Models\Project::findOrFail($parentVersion->project_id);
        $this->repository->uploadAudio($project, $data);

        return redirect()->back()->with('success', 'Nova versão enviada!');
    }

    public function setActive(int $id)
    {
        $this->repository->setActiveVersion($id);
        return redirect()->back()->with('success', 'Versão ativada!');
    }
}
