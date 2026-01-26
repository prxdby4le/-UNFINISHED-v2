<?php

namespace App\Repositories;

use App\Models\Feedback;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class FeedbackRepository
{
    public function getFeedbackByVersion(int $audioVersionId): Collection
    {
        return Feedback::where('audio_version_id', $audioVersionId)
            ->with(['user.profile'])
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function getFeedbackByVersionPaginated(int $audioVersionId, int $perPage = 10)
    {
        return Feedback::where('audio_version_id', $audioVersionId)
            ->with(['user.profile'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function createFeedback(array $data): Feedback
    {
        $data['user_id'] = Auth::id();

        return Feedback::create($data);
    }

    public function updateFeedback(int $id, array $data): Feedback
    {
        $feedback = Feedback::where('user_id', Auth::id())->findOrFail($id);
        $feedback->update($data);

        return $feedback->fresh();
    }

    public function deleteFeedback(int $id): bool
    {
        $feedback = Feedback::where('user_id', Auth::id())->findOrFail($id);

        return $feedback->delete();
    }

    public function getFeedbackCount(int $audioVersionId): int
    {
        return Feedback::where('audio_version_id', $audioVersionId)->count();
    }
}
