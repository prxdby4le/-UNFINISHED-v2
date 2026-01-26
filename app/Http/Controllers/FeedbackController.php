<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreFeedbackRequest;
use App\Repositories\FeedbackRepository;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    public function __construct(
        private FeedbackRepository $repository
    ) {
    }

    public function index(int $audioVersionId)
    {
        $feedback = $this->repository->getFeedbackByVersion($audioVersionId);
        $count = $this->repository->getFeedbackCount($audioVersionId);

        return Inertia::render('feedback/Index', [
            'audioVersionId' => $audioVersionId,
            'feedback' => $feedback,
            'count' => $count,
            'currentUserId' => auth()->id(),
        ]);
    }

    public function store(StoreFeedbackRequest $request, int $audioVersionId)
    {
        $data = $request->validated();
        $data['audio_version_id'] = $audioVersionId;

        $feedback = $this->repository->createFeedback($data);

        return redirect()->back()->with('success', 'Comentário adicionado com sucesso!');
    }

    public function update(StoreFeedbackRequest $request, int $id)
    {
        $data = $request->validated();
        $feedback = $this->repository->updateFeedback($id, $data);

        return redirect()->back()->with('success', 'Comentário atualizado com sucesso!');
    }

    public function destroy(int $id)
    {
        $this->repository->deleteFeedback($id);

        return redirect()->back()->with('success', 'Comentário deletado com sucesso!');
    }
}
