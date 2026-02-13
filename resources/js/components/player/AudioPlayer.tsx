import { useEffect, useRef, useState } from 'react';
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
    Square,
    Music,
    ChevronUp,
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
    const [showVolumeControl, setShowVolumeControl] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const volumeContainerRef = useRef<HTMLDivElement>(null);

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        player.seek(time);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseFloat(e.target.value);
        player.setVolume(volume);
    };

    const handlePlaybackRateChange = (rate: number) => {
        player.setPlaybackRate(rate);
    };

    const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        player.setPitch(parseInt(e.target.value, 10));
    };

    const toggleLoopMode = () => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(player.loopMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        player.setLoopMode(modes[nextIndex]);
    };

    if (!player.currentTrack) {
        return null;
    }

    const track = player.currentTrack;
    const project = track.project;
    const format = track.format?.toUpperCase() || '—';

    return (
        <>
            {/* Mini Player - clicável para expandir */}
            <div
                onClick={() => setIsExpanded(true)}
                className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width,0)] border-t bg-background shadow-[0_-4px_20px_rgba(0,0,0,0.1)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.3)] z-30 cursor-pointer hover:bg-muted/20 transition-colors min-h-[72px] md:min-h-[80px] flex items-center"
            >
                <div className="w-full px-4 py-3 md:px-6 md:py-4">
                    <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-6 max-w-[1600px] mx-auto">
                        {/* Track Info + Cover */}
                        <div className="flex items-center gap-3 flex-1 min-w-0 w-full sm:min-w-[200px] sm:max-w-[280px]">
                            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                                {project?.cover_path ? (
                                    <img
                                        src={`/storage/${project.cover_path}`}
                                        alt={project.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Music className="size-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium truncate text-sm md:text-base">{track.name}</p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {project ? `${project.name} • ${format}` : format}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="flex-shrink-0 md:hidden"
                                onClick={() => setIsExpanded(true)}
                            >
                                <ChevronUp className="size-5" />
                            </Button>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-1 md:gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => player.toggleShuffle()} className={player.shuffle ? 'bg-primary/10' : ''}>
                                <Shuffle className="size-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.previous}>
                                <SkipBack className="size-4" />
                            </Button>
                            <Button
                                variant="default"
                                size="icon"
                                onClick={player.isPlaying ? player.pause : player.play}
                                className="size-10 md:size-12"
                            >
                                {player.isPlaying ? <Pause className="size-5 md:size-6" /> : <Play className="size-5 md:size-6 ml-0.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.next}>
                                <SkipForward className="size-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleLoopMode}
                                className={player.loopMode !== 'off' ? 'bg-primary/10' : ''}
                            >
                                {player.loopMode === 'one' ? <Repeat1 className="size-4" /> : <Repeat className="size-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.stop}>
                                <Square className="size-4" />
                            </Button>
                        </div>

                        {/* Progress bar */}
                        <div className="flex-1 min-w-0 w-full sm:min-w-[200px] flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <span className="text-xs text-muted-foreground w-9 flex-shrink-0">{formatTime(player.currentTime)}</span>
                            <input
                                type="range"
                                min="0"
                                max={player.duration || 0}
                                value={player.currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(player.currentTime / (player.duration || 1)) * 100}%, hsl(var(--muted)) ${(player.currentTime / (player.duration || 1)) * 100}%, hsl(var(--muted)) 100%)`,
                                }}
                            />
                            <span className="text-xs text-muted-foreground w-9 flex-shrink-0">{formatTime(player.duration)}</span>
                        </div>

                        {/* Volume - container mantém popover visível ao hover no slider */}
                        <div
                            ref={volumeContainerRef}
                            className="relative flex items-center gap-2"
                            onMouseEnter={() => setShowVolumeControl(true)}
                            onMouseLeave={() => setShowVolumeControl(false)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Button variant="ghost" size="icon">
                                {player.volume === 0 ? <VolumeX className="size-4 md:size-5" /> : <Volume2 className="size-4 md:size-5" />}
                            </Button>
                            {showVolumeControl && (
                                <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg z-50">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={player.volume}
                                        onChange={handleVolumeChange}
                                        className="w-28 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <p className="text-xs text-center mt-2">{Math.round(player.volume * 100)}%</p>
                                </div>
                            )}
                        </div>

                        {/* Speed - mini */}
                        <div className="hidden lg:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            {[0.5, 1, 1.5, 2].map((rate) => (
                                <Button
                                    key={rate}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePlaybackRateChange(rate)}
                                    className={`h-7 px-2 text-xs ${player.playbackRate === rate ? 'bg-primary/10' : ''}`}
                                >
                                    {rate}x
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Player Expandido */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Player</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        {/* Capa + Info */}
                        <div className="flex gap-6 items-start">
                            <div className="flex-shrink-0 w-48 h-48 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                                {project?.cover_path ? (
                                    <img src={`/storage/${project.cover_path}`} alt={project.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Music className="size-20 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-2xl font-semibold truncate">{track.name}</p>
                                {project && <p className="text-muted-foreground mt-1">Projeto: {project.name}</p>}
                                <p className="text-sm text-muted-foreground mt-2">{format} • {track.duration ? formatTime(track.duration) : '—'}</p>
                            </div>
                        </div>

                        {/* Waveform */}
                        <div>
                            <RealWaveform
                                audioUrl={track.file_path ? `/storage/${track.file_path}` : ''}
                                currentTime={player.currentTime}
                                duration={player.duration}
                                onSeek={player.seek}
                            />
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-muted-foreground">{formatTime(player.currentTime)}</span>
                                <input
                                    type="range"
                                    min="0"
                                    max={player.duration || 0}
                                    value={player.currentTime}
                                    onChange={handleSeek}
                                    className="flex-1 h-3 bg-muted rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${(player.currentTime / (player.duration || 1)) * 100}%, hsl(var(--muted)) ${(player.currentTime / (player.duration || 1)) * 100}%, hsl(var(--muted)) 100%)`,
                                    }}
                                />
                                <span className="text-xs text-muted-foreground">{formatTime(player.duration)}</span>
                            </div>
                        </div>

                        {/* Controles */}
                        <div className="flex justify-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => player.toggleShuffle()} className={player.shuffle ? 'bg-primary/10' : ''}>
                                <Shuffle className="size-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.previous}>
                                <SkipBack className="size-5" />
                            </Button>
                            <Button variant="default" size="icon" className="size-14" onClick={player.isPlaying ? player.pause : player.play}>
                                {player.isPlaying ? <Pause className="size-7" /> : <Play className="size-7 ml-1" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.next}>
                                <SkipForward className="size-5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleLoopMode} className={player.loopMode !== 'off' ? 'bg-primary/10' : ''}>
                                {player.loopMode === 'one' ? <Repeat1 className="size-5" /> : <Repeat className="size-5" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={player.stop}>
                                <Square className="size-5" />
                            </Button>
                        </div>

                        {/* Velocidade e Tom */}
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Velocidade</label>
                                <div className="flex flex-wrap gap-2">
                                    {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                                        <Button
                                            key={rate}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePlaybackRateChange(rate)}
                                            className={player.playbackRate === rate ? 'bg-primary text-primary-foreground' : ''}
                                        >
                                            {rate}x
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Tom: {player.pitchSemitones > 0 ? '+' : ''}{player.pitchSemitones} semitons</label>
                                <input
                                    type="range"
                                    min="-12"
                                    max="12"
                                    value={player.pitchSemitones}
                                    onChange={handlePitchChange}
                                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Volume no expandido */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Volume: {Math.round(player.volume * 100)}%</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.01"
                                value={player.volume}
                                onChange={handleVolumeChange}
                                className="w-full h-3 bg-muted rounded-lg appearance-none cursor-pointer"
                            />
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
