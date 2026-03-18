import { router } from '@inertiajs/react';

export interface AudioVersion {
    id: number;
    project_id: number;
    name: string;
    original_filename: string | null;
    file_path: string;
    url: string | null;
    format: string;
    duration?: number;
    size: number;
    is_master: boolean;
    is_active: boolean;
    track_id: string;
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

    async getVersionHistory(id: number): Promise<AudioVersion[]> {
        const response = await fetch(`/audio-versions/${id}/history`);
        return response.json();
    },

    uploadNewVersion(id: number, file: File, onSuccess?: () => void): void {
        const formData = new FormData();
        formData.append('file', file);
        router.post(`/audio-versions/${id}/new-version`, formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess,
        });
    },

    setActiveVersion(id: number, onSuccess?: () => void): void {
        router.put(`/audio-versions/${id}/set-active`, {}, {
            preserveScroll: true,
            onSuccess,
        });
    },
};
