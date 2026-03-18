import { router } from '@inertiajs/react';

export interface Project {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    cover_path?: string;
    cover_url?: string;
    created_at: string;
    updated_at: string;
    audio_versions_count?: number;
}

export const projectRepository = {
    getProjects(search?: string): void {
        router.get('/projects', { search }, {
            preserveState: true,
            preserveScroll: true,
        });
    },
};
