import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { useState } from 'react';

export default function AudioPlayer() {
    const player = usePlayer();
    const [showVolumeControl, setShowVolumeControl] = useState(false);

    const formatTime = (seconds: number): string => {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${String(secs).padStart(2, '0')}`;
    };

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

    const toggleLoopMode = () => {
        const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
        const currentIndex = modes.indexOf(player.loopMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        player.setLoopMode(modes[nextIndex]);
    };

    if (!player.currentTrack) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 md:left-[var(--sidebar-width)] right-0 border-t bg-background p-2 md:p-4 shadow-lg z-30">
            <div className="mx-auto max-w-7xl">
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                    {/* Track Info */}
                    <div className="flex-1 min-w-0 w-full md:w-auto text-center md:text-left">
                        <p className="font-medium truncate text-sm md:text-base">{player.currentTrack.name}</p>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">
                            {player.currentTrack.format.toUpperCase()}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={player.toggleShuffle}
                            className={player.shuffle ? 'bg-primary/10' : ''}
                        >
                            <Shuffle className="size-4" />
                        </Button>

                        <Button variant="ghost" size="icon" onClick={player.previous}>
                            <SkipBack className="size-4" />
                        </Button>

                        <Button
                            variant="default"
                            size="icon"
                            onClick={player.isPlaying ? player.pause : player.play}
                            className="size-10"
                        >
                            {player.isPlaying ? (
                                <Pause className="size-5" />
                            ) : (
                                <Play className="size-5" />
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={player.next}>
                            <SkipForward className="size-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleLoopMode}
                            className={
                                player.loopMode !== 'off' ? 'bg-primary/10' : ''
                            }
                        >
                            {player.loopMode === 'one' ? (
                                <Repeat1 className="size-4" />
                            ) : (
                                <Repeat className="size-4" />
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" onClick={player.stop}>
                            <Square className="size-4" />
                        </Button>
                    </div>

                    {/* Progress */}
                    <div className="flex-1 min-w-0 w-full md:w-auto order-3 md:order-none">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-10 md:w-12 text-right hidden sm:inline">
                                {formatTime(player.currentTime)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={player.duration || 0}
                                value={player.currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${
                                        (player.currentTime / (player.duration || 1)) * 100
                                    }%, hsl(var(--muted)) ${
                                        (player.currentTime / (player.duration || 1)) * 100
                                    }%, hsl(var(--muted)) 100%)`,
                                }}
                            />
                            <span className="text-xs text-muted-foreground w-10 md:w-12 hidden sm:inline">
                                {formatTime(player.duration)}
                            </span>
                        </div>
                    </div>

                    {/* Volume & Speed */}
                    <div className="flex items-center gap-2 order-2 md:order-none hidden md:flex">
                        <div className="relative">
                            <Button
                                variant="ghost"
                                size="icon"
                                onMouseEnter={() => setShowVolumeControl(true)}
                                onMouseLeave={() => setShowVolumeControl(false)}
                            >
                                {player.volume === 0 ? (
                                    <VolumeX className="size-4" />
                                ) : (
                                    <Volume2 className="size-4" />
                                )}
                            </Button>
                            {showVolumeControl && (
                                <div className="absolute bottom-full right-0 mb-2 p-2 bg-popover border rounded-lg shadow-lg">
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={player.volume}
                                        onChange={handleVolumeChange}
                                        className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                                    />
                                    <p className="text-xs text-center mt-1">
                                        {Math.round(player.volume * 100)}%
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlaybackRateChange(0.5)}
                                className={player.playbackRate === 0.5 ? 'bg-primary/10' : ''}
                            >
                                0.5x
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlaybackRateChange(1)}
                                className={player.playbackRate === 1 ? 'bg-primary/10' : ''}
                            >
                                1x
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlaybackRateChange(1.5)}
                                className={player.playbackRate === 1.5 ? 'bg-primary/10' : ''}
                            >
                                1.5x
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handlePlaybackRateChange(2)}
                                className={player.playbackRate === 2 ? 'bg-primary/10' : ''}
                            >
                                2x
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
