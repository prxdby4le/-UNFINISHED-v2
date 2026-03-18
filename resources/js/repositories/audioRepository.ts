import { router } from '@inertiajs/react';

export interface AudioVersion {
    id: number;
    project_id: number;
    name: string;
    original_filename: string | null;
    file_path: string;
    format: string;
    duration?: number;
    size: number;
    is_master: boolean;
    order: number;
    created_at: string;
    updated_at: string;
}

export const audioRepository = {
    uploadAudio(projectId: number, file: File, name?: string): void {
        const formData = new FormData();
        formData.append('file', file);
        if (name) {
            formData.append('name', name);
        }

        router.post(`/projects/${projectId}/audio-versions`, formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    },

    updateVersion(id: number, data: { name: string }): void {
        router.post(`/audio-versions/${id}`, {
            ...data,
            _method: 'PUT',
        }, {
            preserveScroll: true,
        });
    },

    deleteVersion(id: number): void {
        router.delete(`/audio-versions/${id}`, {
            preserveScroll: true,
        });
    },

    reorderVersions(projectId: number, versionIds: number[]): void {
        router.post(`/projects/${projectId}/audio-versions/reorder`, {
            version_ids: versionIds,
        }, {
            preserveScroll: true,
        });
    },

    toggleMaster(id: number): void {
        router.post(`/audio-versions/${id}/toggle-master`, {}, {
            preserveScroll: true,
        });
    },
};
