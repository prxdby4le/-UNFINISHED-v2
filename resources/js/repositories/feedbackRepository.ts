import { router } from '@inertiajs/react';

export interface Feedback {
    id: number;
    audio_version_id: number;
    user_id: number;
    content: string;
    timestamp_seconds?: number;
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        profile?: {
            full_name?: string;
            avatar_path?: string;
        };
    };
}

export const feedbackRepository = {
    createFeedback(audioVersionId: number, data: {
        content: string;
        timestamp_seconds?: number;
    }): void {
        router.post(`/audio-versions/${audioVersionId}/feedback`, data, {
            preserveScroll: true,
        });
    },

    updateFeedback(id: number, data: {
        content: string;
        timestamp_seconds?: number;
    }): void {
        router.post(`/feedback/${id}`, {
            ...data,
            _method: 'PUT',
        }, {
            preserveScroll: true,
        });
    },

    deleteFeedback(id: number): void {
        router.delete(`/feedback/${id}`, {
            preserveScroll: true,
        });
    },
};
