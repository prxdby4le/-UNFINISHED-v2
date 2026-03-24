import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';
import { type AudioVersion } from '@/repositories/audioRepository';
import { usePlayer } from '@/providers/PlayerProvider';
import EmptyState from '@/components/EmptyState';
import { EditAudioVersionDialog } from '@/components/EditAudioVersionDialog';
import { ShareDialog } from '@/components/ShareDialog';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, Plus, Download, Play, Pause, Music, GripVertical, Share2, Lock, MessageSquare } from 'lucide-react';
import type { SharedData } from '@/types';

interface Props {
    project: Project & {
        audio_versions: AudioVersion[];
        is_private?: boolean;
    };
    permissions?: {
        can_delete_project: boolean;
        can_share: boolean;
        can_delete_track: boolean;
    };
    colors?: string[] | null;
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

export default function ProjectsShow({ project, permissions }: Props) {
    const player = usePlayer();
    const { auth } = usePage<SharedData>().props;
    const [editingVersion, setEditingVersion] = useState<AudioVersion | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
    const [isPrivate, setIsPrivate] = useState(project.is_private ?? false);
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
        if (confirm('Excluir este projeto? Isso não pode ser desfeito.')) {
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
            <div className="flex flex-col gap-8 md:flex-row md:gap-8">
                {/* Left: Album art */}
                <div className="flex-shrink-0 md:sticky md:top-20 md:self-start">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="mx-auto flex aspect-square w-full max-w-[240px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-muted shadow-sm transition-transform hover:scale-[1.02] focus:outline-hidden focus-visible:ring-2 focus-visible:ring-ring sm:max-w-[300px] md:w-[300px] md:max-w-none lg:w-[340px]">
                                {project.cover_path ? (
                                    <img
                                        src={project.cover_url || `/storage/${project.cover_path}`}
                                        alt={project.name}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <Music className="size-16 text-muted-foreground/20" />
                                )}
                            </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
                            <DialogTitle className="sr-only">Capa do Projeto - {project.name}</DialogTitle>
                            {project.cover_path ? (
                                <img
                                    src={project.cover_url || `/storage/${project.cover_path}`}
                                    alt={project.name}
                                    className="h-auto w-full rounded-md object-contain shadow-2xl"
                                />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center rounded-md bg-muted shadow-2xl">
                                    <Music className="size-32 text-muted-foreground/20" />
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Right: Project info + tracklist */}
                <div className="flex min-w-0 flex-1 flex-col gap-5">
                    {/* Project info */}
                    <div>
                        <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                            {project.name}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {auth.user?.name} &middot; {project.audio_versions.length} faixa{project.audio_versions.length !== 1 ? 's' : ''}
                            {project.audio_versions.length > 0 && (
                                <> &middot; {formatTotalDuration(project.audio_versions)}</>
                            )}
                        </p>
                        {project.description && (
                            <p className="mt-2 text-sm text-muted-foreground/70 leading-relaxed">{project.description}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                        {project.audio_versions.length > 0 && (
                            <Button
                                size="sm"
                                onClick={() => handlePlay()}
                                className="h-8 rounded-full bg-foreground px-4 text-xs text-background hover:bg-foreground/90"
                            >
                                <Play className="size-3 sm:mr-1" />
                                <span className="hidden sm:inline">Tocar</span>
                            </Button>
                        )}
                        <Link href={`/projects/${project.id}/upload`}>
                            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                <Plus className="size-3 sm:mr-1" />
                                <span className="hidden sm:inline">Adicionar</span>
                            </Button>
                        </Link>
                        {project.audio_versions.length > 0 && (
                            <a href={`/projects/${project.id}/download`}>
                                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                    <Download className="size-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Download</span>
                                </Button>
                            </a>
                        )}
                        <div className="ml-auto flex items-center gap-0.5">
                            {permissions?.can_share && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs text-muted-foreground"
                                    onClick={() => setIsShareDialogOpen(true)}
                                >
                                    <Share2 className="size-3 sm:mr-1" />
                                    <span className="hidden sm:inline">Compartilhar</span>
                                    {isPrivate && <Lock className="ml-1 size-2.5" />}
                                </Button>
                            )}
                            <Link href={`/projects/${project.id}/edit`}>
                                <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                                    <Edit className="size-3" />
                                </Button>
                            </Link>
                            {permissions?.can_delete_project && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    className="size-7 text-muted-foreground hover:text-destructive"
                                >
                                    <Trash2 className="size-3" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Tracklist */}
                    {project.audio_versions.length === 0 ? (
                        <EmptyState
                            icon={Music}
                            title="Nenhuma faixa ainda"
                            description="Faça upload de arquivos de áudio para começar"
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
                                    className="group -mx-2 flex cursor-move items-center gap-2 rounded-lg px-2 py-3 transition-colors hover:bg-muted/30 sm:-mx-3 sm:gap-3 sm:px-3 sm:py-2.5"
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
                                        <Link href={`/audio-versions/${version.id}/feedback`}>
                                            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                                                <MessageSquare className="size-3" />
                                            </Button>
                                        </Link>
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
                                        {permissions?.can_delete_track && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-7 text-muted-foreground hover:text-destructive"
                                                onClick={() => {
                                                    if (confirm('Deletar essa faixa? Isso não pode ser desfeito.')) {
                                                        router.delete(`/audio-versions/${version.id}`, { preserveScroll: true });
                                                    }
                                                }}
                                            >
                                                <Trash2 className="size-3" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <EditAudioVersionDialog
                version={editingVersion}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={() => router.reload({ only: ['project'] })}
            />

            <ShareDialog
                projectId={project.id}
                isPrivate={isPrivate}
                open={isShareDialogOpen}
                onOpenChange={setIsShareDialogOpen}
                onPrivacyChange={setIsPrivate}
            />
        </AppLayout>
    );
}
