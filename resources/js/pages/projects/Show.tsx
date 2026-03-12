import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';
import { type AudioVersion } from '@/repositories/audioRepository';
import { usePlayer } from '@/providers/PlayerProvider';
import EmptyState from '@/components/EmptyState';
import { EditAudioVersionDialog } from '@/components/EditAudioVersionDialog';
import { Edit, Trash2, Plus, Download, Play, Pause, Music, GripVertical } from 'lucide-react';
import type { SharedData } from '@/types';

interface Props {
    project: Project & {
        audio_versions: AudioVersion[];
    };
}

function formatDuration(seconds?: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatTotalDuration(versions: AudioVersion[]): string {
    const total = versions.reduce((sum, v) => sum + (v.duration || 0), 0);
    const mins = Math.floor(total / 60);
    if (mins >= 60) {
        const hours = Math.floor(mins / 60);
        const remaining = mins % 60;
        return `${hours}h ${remaining}m`;
    }
    return `${mins}m`;
}

export default function ProjectsShow({ project }: Props) {
    const player = usePlayer();
    const { auth } = usePage<SharedData>().props;
    const [editingVersion, setEditingVersion] = useState<AudioVersion | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [versions, setVersions] = useState<AudioVersion[]>(project.audio_versions);

    useEffect(() => {
        if (project.audio_versions.length > 0) {
            player.loadPlaylist(project.audio_versions, {
                id: project.id,
                name: project.name,
                cover_path: project.cover_path,
            });
        }
        setVersions(project.audio_versions);
    }, [project.id, project.audio_versions, project.name, project.cover_path]);

    const handleDelete = () => {
        if (confirm('Delete this project? This cannot be undone.')) {
            router.delete(`/projects/${project.id}`);
        }
    };

    const handlePlay = (version?: AudioVersion) => {
        const projectInfo = { id: project.id, name: project.name, cover_path: project.cover_path };
        if (version) {
            player.loadTrack({ ...version, project: projectInfo });
        } else if (project.audio_versions.length > 0) {
            player.loadTrack({ ...project.audio_versions[0], project: projectInfo });
        }
        player.play();
    };

    const isTrackPlaying = (version: AudioVersion) =>
        player.currentTrack?.id === version.id && player.isPlaying;

    const handleDragStart = (index: number) => setDraggedIndex(index);

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const next = [...versions];
        const item = next[draggedIndex];
        next.splice(draggedIndex, 1);
        next.splice(index, 0, item);
        setVersions(next);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex === null) return;
        router.post(`/projects/${project.id}/audio-versions/reorder`, {
            version_ids: versions.map((v) => v.id),
        }, {
            preserveScroll: true,
            onSuccess: () => router.reload({ only: ['project'] }),
            onError: () => setVersions(project.audio_versions),
        });
        setDraggedIndex(null);
    };

    return (
        <AppLayout>
            <Head title={project.name} />
            <div className="flex flex-col gap-8">
                {/* Project header */}
                <div className="flex gap-6">
                    <div className="flex size-40 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted sm:size-48">
                        {project.cover_path ? (
                            <img
                                src={`/storage/${project.cover_path}`}
                                alt={project.name}
                                className="size-full object-cover"
                            />
                        ) : (
                            <Music className="size-10 text-muted-foreground/30" />
                        )}
                    </div>

                    <div className="flex flex-1 flex-col justify-end gap-3">
                        <div>
                            <h1 className="text-3xl font-light tracking-tight sm:text-4xl">
                                {project.name}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {auth.user?.name} &middot; {project.audio_versions.length} tracks
                                {project.audio_versions.length > 0 && (
                                    <> &middot; {formatTotalDuration(project.audio_versions)}</>
                                )}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {project.audio_versions.length > 0 && (
                                <Button
                                    size="sm"
                                    onClick={() => handlePlay()}
                                    className="h-9 rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
                                >
                                    <Play className="mr-1 size-3.5" />
                                    Play
                                </Button>
                            )}
                            <Link href={`/projects/${project.id}/upload`}>
                                <Button variant="ghost" size="sm" className="text-muted-foreground">
                                    <Plus className="mr-1 size-3.5" />
                                    Add
                                </Button>
                            </Link>
                            {project.audio_versions.length > 0 && (
                                <a href={`/projects/${project.id}/download`}>
                                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                                        <Download className="mr-1 size-3.5" />
                                        Download
                                    </Button>
                                </a>
                            )}
                            <Link href={`/projects/${project.id}/edit`}>
                                <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                                    <Edit className="size-3.5" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleDelete}
                                className="size-8 text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tracklist */}
                {project.audio_versions.length === 0 ? (
                    <EmptyState
                        icon={Music}
                        title="No tracks yet"
                        description="Upload audio files to get started"
                        action={{ label: 'Upload', href: `/projects/${project.id}/upload` }}
                    />
                ) : (
                    <div className="divide-y divide-border/30">
                        {versions.map((version, index) => (
                            <div
                                key={version.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => e.preventDefault()}
                                onDragEnd={handleDragEnd}
                                className="group -mx-3 flex cursor-move items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/30"
                            >
                                <GripVertical className="size-3.5 flex-shrink-0 text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/50" />

                                <button
                                    onClick={() =>
                                        isTrackPlaying(version) ? player.pause() : handlePlay(version)
                                    }
                                    className="flex size-7 flex-shrink-0 items-center justify-center"
                                >
                                    <span className="block group-hover:hidden text-xs tabular-nums text-muted-foreground">
                                        {index + 1}
                                    </span>
                                    <span className="hidden group-hover:block">
                                        {isTrackPlaying(version) ? (
                                            <Pause className="size-3.5" />
                                        ) : (
                                            <Play className="size-3.5" />
                                        )}
                                    </span>
                                </button>

                                <div className="min-w-0 flex-1">
                                    <p className={`truncate text-sm ${
                                        player.currentTrack?.id === version.id
                                            ? 'font-medium'
                                            : 'font-light'
                                    }`}>
                                        {version.name}
                                    </p>
                                </div>

                                <span className="hidden text-xs uppercase tracking-wider text-muted-foreground/60 sm:block font-mono">
                                    {version.format || version.file_path?.split('.').pop() || ''}
                                </span>

                                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">
                                    {formatDuration(version.duration)}
                                </span>

                                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                                    <a href={`/audio-versions/${version.id}/download`} download>
                                        <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                                            <Download className="size-3" />
                                        </Button>
                                    </a>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7 text-muted-foreground"
                                        onClick={() => {
                                            setEditingVersion(version);
                                            setIsEditDialogOpen(true);
                                        }}
                                    >
                                        <Edit className="size-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <EditAudioVersionDialog
                version={editingVersion}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={() => router.reload({ only: ['project'] })}
            />
        </AppLayout>
    );
}
