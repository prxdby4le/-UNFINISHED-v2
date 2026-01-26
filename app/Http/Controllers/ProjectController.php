<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Repositories\ProjectRepository;
use App\Services\ColorExtractionService;
use App\Services\StorageService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProjectController extends Controller
{
    public function __construct(
        private ProjectRepository $repository,
        private StorageService $storageService,
        private ColorExtractionService $colorService
    ) {
    }

    public function index(Request $request)
    {
        $search = $request->get('search');
        $projects = $this->repository->getProjects($search);

        return Inertia::render('projects/Index', [
            'projects' => $projects->items(),
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
            'search' => $search,
        ]);
    }

    public function create()
    {
        return Inertia::render('projects/Create');
    }

    public function store(StoreProjectRequest $request)
    {
        $data = $request->validated();

        // Handle cover upload
        if ($request->hasFile('cover')) {
            $coverPath = $this->storageService->storeFile($request->file('cover'), 'projects/covers');
            $data['cover_path'] = $coverPath;
        }

        $project = $this->repository->createProject($data);

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Projeto criado com sucesso!');
    }

    public function show(int $id)
    {
        $project = $this->repository->getProject($id);

        // Extract colors from cover if exists
        $colors = null;
        if ($project->cover_path) {
            $fullPath = storage_path('app/public/'.$project->cover_path);
            if (file_exists($fullPath)) {
                $colors = $this->colorService->extractColors($fullPath);
            }
        }

        return Inertia::render('projects/Show', [
            'project' => $project,
            'colors' => $colors,
        ]);
    }

    public function edit(int $id)
    {
        $project = $this->repository->getProject($id);

        return Inertia::render('projects/Edit', [
            'project' => $project,
        ]);
    }

    public function update(UpdateProjectRequest $request, int $id)
    {
        $data = $request->validated();

        // Handle cover upload
        if ($request->hasFile('cover')) {
            $project = $this->repository->getProject($id);
            // Delete old cover
            if ($project->cover_path) {
                $this->storageService->deleteFile($project->cover_path);
            }
            $coverPath = $this->storageService->storeFile($request->file('cover'), 'projects/covers');
            $data['cover_path'] = $coverPath;
        }

        $project = $this->repository->updateProject($id, $data);

        return redirect()->route('projects.show', $project->id)
            ->with('success', 'Projeto atualizado com sucesso!');
    }

    public function destroy(int $id)
    {
        $project = $this->repository->getProject($id);

        // Delete cover if exists
        if ($project->cover_path) {
            $this->storageService->deleteFile($project->cover_path);
        }

        $this->repository->deleteProject($id);

        return redirect()->route('projects.index')
            ->with('success', 'Projeto deletado com sucesso!');
    }
}
