import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { type Project } from '@/repositories/projectRepository';
import { type AudioVersion } from '@/repositories/audioRepository';
import { usePlayer } from '@/providers/PlayerProvider';
import { Play, Pause, Music, Download, Plus, Upload as UploadIcon, Lock } from 'lucide-react';

interface Props {
    project: Project & {
        audio_versions: AudioVersion[];
        user?: { name: string };
    };
    permission: 'view' | 'edit';
    colors: string[] | null;
    token: string;
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

export default function SharedView({ project, permission, colors, token }: Props) {
    const player = usePlayer();

    const handlePlay = (version?: AudioVersion) => {
        const projectInfo = { id: project.id, name: project.name, cover_path: project.cover_path };
        if (version) {
            player.loadTrack({ ...version, project: projectInfo });
        } else if (project.audio_versions.length > 0) {
            player.loadPlaylist(project.audio_versions, projectInfo);
            player.loadTrack({ ...project.audio_versions[0], project: projectInfo });
        }
        player.play();
    };

    const isTrackPlaying = (version: AudioVersion) =>
        player.currentTrack?.id === version.id && player.isPlaying;

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            {/* Minimal header */}
            <header className="border-b border-border/30">
                <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
                    <Link href="/" className="flex items-center gap-2">
                        <Music className="size-4" />
                        <span className="text-sm font-medium tracking-tight">[UNFINISHED]</span>
                    </Link>
                    <span className="rounded-full border border-border/40 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {permission === 'view' ? 'somente visualização' : 'acesso de edição'}
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8 pb-24">
                <Head title={`${project.name} — Compartilhado`} />

                <div className="flex flex-col gap-8 md:flex-row md:gap-8">
                    {/* Left: Album art */}
                    <div className="flex-shrink-0 md:sticky md:top-20 md:self-start">
                        <div className="mx-auto flex aspect-square w-full max-w-[300px] items-center justify-center overflow-hidden rounded-xl bg-muted shadow-sm md:max-w-none md:w-[300px] lg:w-[340px]">
                            {project.cover_path ? (
                                <img
                                    src={project.cover_url || `/storage/${project.cover_path}`}
                                    alt={project.name}
                                    className="size-full object-cover"
                                />
                            ) : (
                                <Music className="size-16 text-muted-foreground/20" />
                            )}
                        </div>
                    </div>

                    {/* Right: Project info + tracklist */}
                    <div className="flex min-w-0 flex-1 flex-col gap-5">
                        <div>
                            <h1 className="text-2xl font-medium tracking-tight sm:text-3xl">
                                {project.name}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {project.user?.name || 'Desconhecido'} &middot; {project.audio_versions.length} faixa{project.audio_versions.length !== 1 ? 's' : ''}
                                {project.audio_versions.length > 0 && (
                                    <> &middot; {formatTotalDuration(project.audio_versions)}</>
                                )}
                            </p>
                            {project.description && (
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground/70">{project.description}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                            {project.audio_versions.length > 0 && (
                                <Button
                                    size="sm"
                                    onClick={() => handlePlay()}
                                    className="h-8 rounded-full bg-foreground px-4 text-xs text-background hover:bg-foreground/90"
                                >
                                    <Play className="mr-1 size-3" />
                                    Tocar
                                </Button>
                            )}
                            {permission === 'edit' && (
                                <Link href={`/share/${token}/upload`}>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                                        <Plus className="mr-1 size-3" />
                                        Adicionar
                                    </Button>
                                </Link>
                            )}
                        </div>

                        {/* Tracklist */}
                        {project.audio_versions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Music className="size-8 text-muted-foreground/20" />
                                <p className="mt-3 text-sm text-muted-foreground">Nenhuma faixa ainda</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {project.audio_versions.map((version, index) => (
                                    <div
                                        key={version.id}
                                        className="group -mx-3 flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/30"
                                    >
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
