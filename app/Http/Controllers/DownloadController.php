<?php

namespace App\Http\Controllers;

use App\Models\AudioVersion;
use App\Models\Project;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use ZipArchive;

class DownloadController extends Controller
{
    public function __construct(
        private StorageService $storageService
    ) {
    }

    public function downloadVersion(int $id)
    {
        $version = AudioVersion::whereHas('project', function ($query) {
            $query->where('user_id', auth()->id());
        })->findOrFail($id);

        $filePath = storage_path('app/public/'.$version->file_path);

        if (!file_exists($filePath)) {
            abort(404, 'Arquivo não encontrado');
        }

        // Ensure format is included in filename
        $format = $version->format ?: pathinfo($filePath, PATHINFO_EXTENSION);
        $filename = $version->name.'.'.$format;

        return response()->download($filePath, $filename);
    }

    public function downloadProject(int $projectId)
    {
        $project = Project::where('user_id', auth()->id())
            ->with('audioVersions')
            ->findOrFail($projectId);

        if ($project->audioVersions->isEmpty()) {
            return redirect()->back()->with('error', 'Nenhuma versão de áudio encontrada no projeto.');
        }

        $zip = new ZipArchive();
        $zipFileName = storage_path('app/temp/'.$project->name.'_'.time().'.zip');

        // Create temp directory if it doesn't exist
        $tempDir = storage_path('app/temp');
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        if ($zip->open($zipFileName, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            return redirect()->back()->with('error', 'Não foi possível criar o arquivo ZIP.');
        }

        foreach ($project->audioVersions as $version) {
            $filePath = storage_path('app/public/'.$version->file_path);
            if (file_exists($filePath)) {
                $format = $version->format ?: pathinfo($filePath, PATHINFO_EXTENSION);
                $zip->addFile($filePath, $version->name.'.'.$format);
            }
        }

        $zip->close();

        return response()->download($zipFileName, $project->name.'.zip')->deleteFileAfterSend(true);
    }
}
