import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { usePlayer } from '@/providers/PlayerProvider';
import {
    Play,
    Pause,
    SkipForward,
    SkipBack,
    Volume2,
    VolumeX,
    Repeat,
    Repeat1,
    Shuffle,
    Music,
} from 'lucide-react';
import { RealWaveform } from './RealWaveform';

function formatTime(seconds: number): string {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function AudioPlayer() {
    const player = usePlayer();
    const [showVolume, setShowVolume] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const volumeRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    if (!player.currentTrack) return null;

    const track = player.currentTrack;
    const project = track.project;
    const format = track.format?.toUpperCase() || '';
    const progress = player.duration ? (player.currentTime / player.duration) * 100 : 0;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!progressRef.current || !player.duration) return;
        const rect = progressRef.current.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        player.seek(ratio * player.duration);
    };

    const handleExpandedSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        player.seek(parseFloat(e.target.value));
    };

    const toggleLoop = () => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const next = (modes.indexOf(player.loopMode) + 1) % modes.length;
        player.setLoopMode(modes[next]);
    };

    return (
        <>
            {/* Mini player */}
            <div
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-0 left-0 right-0 z-30 cursor-pointer border-t border-border/40 bg-background/85 dark:bg-background/80 backdrop-blur-2xl transition-all hover:bg-background/95 dark:hover:bg-background/90 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
            >
                {/* Thin progress bar at top */}
                <div
                    ref={progressRef}
                    className="h-1 w-full bg-muted/80 dark:bg-muted/50 transition-all hover:h-1.5 relative group"
                    onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
                >
                    <div
                        className="h-full bg-primary transition-[width] duration-100 ease-linear shadow-[0_0_10px_hsl(var(--primary))]"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="mx-auto flex h-14 max-w-4xl items-center gap-4 px-6">
                    {/* Track info */}
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex size-9 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                            {project?.cover_path ? (
                                <img src={project.cover_url || `/storage/${project.cover_path}`} alt="" className="size-full object-cover" />
                            ) : (
                                <Music className="size-3.5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm">{track.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                                {project?.name}{format && ` · ${format}`}
                            </p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button onClick={player.previous} className="p-1.5 text-muted-foreground hover:text-foreground">
                            <SkipBack className="size-3.5" />
                        </button>
                        <button
                            onClick={player.isPlaying ? player.pause : player.play}
                            className="flex size-8 items-center justify-center rounded-full bg-foreground text-background"
                        >
                            {player.isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 ml-px" />}
                        </button>
                        <button onClick={player.next} className="p-1.5 text-muted-foreground hover:text-foreground">
                            <SkipForward className="size-3.5" />
                        </button>
                    </div>

                    {/* Time */}
                    <div className="hidden items-center gap-1.5 sm:flex" onClick={(e) => e.stopPropagation()}>
                        <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                            {formatTime(player.currentTime)}
                        </span>
                        <span className="text-xs text-muted-foreground/40">/</span>
                        <span className="w-9 text-xs tabular-nums text-muted-foreground">
                            {formatTime(player.duration)}
                        </span>
                    </div>

                    {/* Volume */}
                    <div
                        ref={volumeRef}
                        className="relative hidden items-center lg:flex"
                        onMouseEnter={() => setShowVolume(true)}
                        onMouseLeave={() => setShowVolume(false)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => player.setVolume(player.volume === 0 ? 1 : 0)}
                            className="p-1.5 text-muted-foreground hover:text-foreground"
                        >
                            {player.volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                        </button>
                        {showVolume && (
                            <div className="absolute bottom-full right-0 pb-2">
                                <div className="rounded-lg border border-border/40 bg-popover p-3 shadow-lg">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={player.volume}
                                        onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                                        className="h-1.5 w-24 cursor-pointer appearance-none rounded-full bg-muted"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded player */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-lg" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="sr-only">Player</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="flex gap-5 items-start">
                            <div className="relative flex size-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted shadow-lg">
                                {project?.cover_path ? (
                                    <>
                                        <div 
                                            className="absolute inset-0 bg-cover bg-center opacity-40 blur-xl scale-150" 
                                            style={{ backgroundImage: `url(${project.cover_url || `/storage/${project.cover_path}`})` }}
                                        />
                                        <img src={project.cover_url || `/storage/${project.cover_path}`} alt="" className="relative z-10 size-full object-cover rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.5)]" />
                                    </>
                                ) : (
                                    <Music className="size-12 text-muted-foreground/30 relative z-10" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 pt-1">
                                <p className="truncate text-lg font-medium">{track.name}</p>
                                {project && <p className="text-sm text-muted-foreground">{project.name}</p>}
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {format}{track.duration ? ` · ${formatTime(track.duration)}` : ''}
                                </p>
                                {track.original_filename && (
                                    <p className="mt-1.5 text-xs text-muted-foreground/60 flex items-center gap-1.5" title="Arquivo Original">
                                        <Music className="size-3" />
                                        <span className="truncate">{track.original_filename}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Waveform */}
                        <RealWaveform
                            audioUrl={track.file_path ? `/storage/${track.file_path}` : ''}
                            currentTime={player.currentTime}
                            duration={player.duration}
                            onSeek={player.seek}
                        />

                        {/* Seek bar */}
                        <div className="flex items-center gap-2">
                            <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">
                                {formatTime(player.currentTime)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={player.duration || 0}
                                value={player.currentTime}
                                onChange={handleExpandedSeek}
                                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-muted/50"
                                style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`,
                                }}
                            />
                            <span className="w-9 text-xs tabular-nums text-muted-foreground">
                                {formatTime(player.duration)}
                            </span>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`size-8 ${player.shuffle ? 'text-foreground' : 'text-muted-foreground'}`}
                                onClick={() => player.toggleShuffle()}
                            >
                                <Shuffle className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-8" onClick={player.previous}>
                                <SkipBack className="size-4" />
                            </Button>
                            <button
                                onClick={player.isPlaying ? player.pause : player.play}
                                className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105"
                            >
                                {player.isPlaying ? <Pause className="size-6" /> : <Play className="size-6 ml-1" />}
                            </button>
                            <Button variant="ghost" size="icon" className="size-8" onClick={player.next}>
                                <SkipForward className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={`size-8 ${player.loopMode !== 'off' ? 'text-foreground' : 'text-muted-foreground'}`}
                                onClick={toggleLoop}
                            >
                                {player.loopMode === 'one' ? <Repeat1 className="size-3.5" /> : <Repeat className="size-3.5" />}
                            </Button>
                        </div>

                        {/* Speed + Pitch */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">Speed</p>
                                <div className="flex flex-wrap gap-1">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => player.setPlaybackRate(rate)}
                                            className={`rounded px-2 py-1 text-xs transition-colors ${
                                                player.playbackRate === rate
                                                    ? 'bg-foreground text-background'
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {rate}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <p className="mb-2 text-xs font-medium text-muted-foreground">
                                    Pitch{player.pitchSemitones !== 0 ? ' (varispeed)' : ''}: {player.pitchSemitones > 0 ? '+' : ''}{player.pitchSemitones}st
                                </p>
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    value={player.pitchSemitones}
                                    onChange={(e) => player.setPitch(parseInt(e.target.value, 10))}
                                    className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted"
                                />
                            </div>
                        </div>

                        {/* Volume */}
                        <div>
                            <p className="mb-2 text-xs font-medium text-muted-foreground">
                                Volume: {Math.round(player.volume * 100)}%
                            </p>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={player.volume}
                                onChange={(e) => player.setVolume(parseFloat(e.target.value))}
                                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
