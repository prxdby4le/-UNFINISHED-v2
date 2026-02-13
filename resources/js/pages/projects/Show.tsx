import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type Project } from '@/repositories/projectRepository';
import { type AudioVersion } from '@/repositories/audioRepository';
import { usePlayer } from '@/providers/PlayerProvider';
import EmptyState from '@/components/EmptyState';
import { EditAudioVersionDialog } from '@/components/EditAudioVersionDialog';
import { Edit, Trash2, Plus, Download, Play, Music, Share2, MoreVertical, GripVertical, Download as DownloadIcon } from 'lucide-react';
import type { SharedData } from '@/types';

interface Props {
    project: Project & {
        audio_versions: AudioVersion[];
    };
    colors?: {
        primary: string;
        secondary: string;
        accent: string;
    };
}

export default function ProjectsShow({ project, colors }: Props) {
    const player = usePlayer();
    const { auth } = usePage<SharedData>().props;
    const [editingVersion, setEditingVersion] = useState<AudioVersion | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [versions, setVersions] = useState<AudioVersion[]>(project.audio_versions);

    useEffect(() => {
        if (project.audio_versions.length > 0) {
            player.loadPlaylist(project.audio_versions, { id: project.id, name: project.name, cover_path: project.cover_path });
        }
        setVersions(project.audio_versions);
    }, [project.id, project.audio_versions, project.name, project.cover_path]);

    const handleDelete = () => {
        if (confirm('Tem certeza que deseja deletar este projeto? Esta ação não pode ser desfeita.')) {
            router.delete(`/projects/${project.id}`);
        }
    };

    const handlePlay = (version?: AudioVersion) => {
        if (version) {
            player.loadTrack(version);
        } else if (project.audio_versions.length > 0) {
            player.loadTrack(project.audio_versions[0]);
        }
        player.play();
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

    const getTotalDuration = (): number => {
        return project.audio_versions.reduce((total, version) => total + (version.duration || 0), 0);
    };

    const formatTotalDuration = (): string => {
        const total = getTotalDuration();
        const mins = Math.floor(total / 60);
        const secs = total % 60;
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            return `${hours}h ${remainingMins}m`;
        }
        return `${mins}m ${secs}s`;
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffHours < 1) return 'just now';
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        if (draggedIndex === null || draggedIndex === index) return;

        const newVersions = [...versions];
        const draggedItem = newVersions[draggedIndex];
        newVersions.splice(draggedIndex, 1);
        newVersions.splice(index, 0, draggedItem);
        setVersions(newVersions);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex === null) {
            setDraggedIndex(null);
            return;
        }

        const versionIds = versions.map(v => v.id);
        router.post(`/projects/${project.id}/audio-versions/reorder`, {
            version_ids: versionIds,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setDraggedIndex(null);
                router.reload({ only: ['project'] });
            },
            onError: () => {
                // Revert on error
                setVersions(project.audio_versions);
                setDraggedIndex(null);
            },
        });
    };

    const handleEditVersion = (version: AudioVersion) => {
        setEditingVersion(version);
        setIsEditDialogOpen(true);
    };

    const handleEditSuccess = () => {
        router.reload({ only: ['project'] });
    };

    return (
        <AppLayout>
            <Head title={project.name} />
            <div className="flex h-full flex-1 flex-col overflow-x-auto">
                <div className="flex flex-1 gap-6 p-6">
                    {/* Cover Art - Left Side */}
                    <div className="flex-shrink-0">
                        {project.cover_path ? (
                            <div className="relative aspect-square w-56 overflow-hidden rounded-2xl">
                                <img
                                    src={`/storage/${project.cover_path}`}
                                    alt={project.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="relative aspect-square w-56 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 border border-border/50">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Music className="size-16 text-muted-foreground/30" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Project Info - Right Side */}
                    <div className="flex flex-1 flex-col gap-4">
                        {/* Header with Actions */}
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h1 className="text-5xl font-light tracking-tight mb-2">{project.name}</h1>
                                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                                    <span>{auth.user?.name || 'Unknown'}</span>
                                    <span>•</span>
                                    <span>{project.audio_versions.length} tracks</span>
                                    {project.audio_versions.length > 0 && (
                                        <>
                                            <span>•</span>
                                            <span>{formatTotalDuration()}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="border border-border/50"
                                >
                                    <Share2 className="size-4" />
                                </Button>
                                <Link href={`/projects/${project.id}/edit`}>
                                    <Button variant="ghost" size="icon" className="border border-border/50">
                                        <Edit className="size-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleDelete}
                                    className="border border-border/50 text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Play Button */}
                        {project.audio_versions.length > 0 && (
                            <div className="flex items-center gap-3">
                                <Button
                                    size="lg"
                                    onClick={() => handlePlay()}
                                    className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 p-0"
                                >
                                    <Play className="size-6 ml-0.5" />
                                </Button>
                                <Link href={`/projects/${project.id}/upload`}>
                                    <Button
                                        variant="outline"
                                        className="border-border/50 bg-card"
                                    >
                                        <Plus className="size-4 mr-2" />
                                        Add tracks
                                    </Button>
                                </Link>
                                {project.audio_versions.length > 0 && (
                                    <a href={`/projects/${project.id}/download`}>
                                        <Button
                                            variant="outline"
                                            className="border-border/50 bg-card"
                                        >
                                            <DownloadIcon className="size-4 mr-2" />
                                            Download Project
                                        </Button>
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Tracklist */}
                        {project.audio_versions.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                                <EmptyState
                                    icon={Music}
                                    title="No tracks yet"
                                    description="Add tracks to your project to get started"
                                    action={{
                                        label: 'Add tracks',
                                        href: `/projects/${project.id}/upload`,
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="space-y-0">
                                    {versions.map((version, index) => (
                                        <div
                                            key={version.id}
                                            draggable
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => e.preventDefault()}
                                            onDragEnd={handleDragEnd}
                                            className="group flex items-center gap-3 px-3 py-2 hover:bg-muted/30 transition-colors rounded-lg cursor-move"
                                        >
                                            <div className="flex-shrink-0 w-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-1">
                                                <GripVertical className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <span>{index + 1}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-base font-light truncate">
                                                    {version.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <span className="uppercase font-mono">
                                                        {version.format || version.file_path?.split('.').pop() || '—'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{version.duration ? formatDuration(version.duration) : '—'}</span>
                                                    <span>•</span>
                                                    <span>{version.created_at ? formatDate(version.created_at) : ''}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handlePlay(version)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Play className="size-4" />
                                                </Button>
                                                <a
                                                    href={`/audio-versions/${version.id}/download`}
                                                    download
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Button variant="ghost" size="icon">
                                                        <Download className="size-4" />
                                                    </Button>
                                                </a>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditVersion(version)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Edit className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <MoreVertical className="size-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <EditAudioVersionDialog
                version={editingVersion}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSuccess={handleEditSuccess}
            />
        </AppLayout>
    );
}
