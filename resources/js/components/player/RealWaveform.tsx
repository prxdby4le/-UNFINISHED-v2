import { useEffect, useRef, useState } from 'react';

interface RealWaveformProps {
    audioUrl: string;
    currentTime: number;
    duration: number;
    onSeek?: (time: number) => void;
}

export function RealWaveform({ audioUrl, currentTime, duration, onSeek }: RealWaveformProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [peaks, setPeaks] = useState<number[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!audioUrl) {
            setLoading(false);
            return;
        }

        let cancelled = false;

        const loadWaveform = async () => {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(audioUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                if (cancelled) return;

                const channelData = audioBuffer.getChannelData(0);
                const samples = 120;
                const blockSize = Math.floor(channelData.length / samples);
                const filtered: number[] = [];

                for (let i = 0; i < samples; i++) {
                    const start = i * blockSize;
                    let max = 0;
                    for (let j = 0; j < blockSize && start + j < channelData.length; j++) {
                        const val = Math.abs(channelData[start + j]);
                        if (val > max) max = val;
                    }
                    filtered.push(max);
                }

                const maxPeak = Math.max(...filtered, 0.001);
                const normalized = filtered.map((p) => p / maxPeak);
                setPeaks(normalized);
            } catch {
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadWaveform();
        return () => {
            cancelled = true;
        };
    }, [audioUrl]);

    useEffect(() => {
        if (!peaks || !canvasRef.current || !containerRef.current) return;

        const canvas = canvasRef.current;
        const rect = containerRef.current.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width;
        const h = 56;

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, w, h);

        const progress = duration > 0 ? currentTime / duration : 0;
        const barWidth = w / peaks.length - 2;
        const gap = 2;

        peaks.forEach((peak, i) => {
            const x = i * (barWidth + gap);
            const barH = Math.max(4, peak * (h - 8));
            const y = (h - barH) / 2;
            const isActive = i / peaks.length <= progress;

            ctx.fillStyle = isActive
                ? 'hsl(var(--primary))'
                : 'hsl(var(--muted-foreground) / 0.3)';
            ctx.fillRect(x, y, barWidth, barH);
        });
    }, [peaks, currentTime, duration]);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!onSeek || !containerRef.current || duration <= 0) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const progress = Math.max(0, Math.min(1, x / rect.width));
        onSeek(progress * duration);
    };

    if (loading) {
        return (
            <div className="h-14 w-full flex items-center justify-center bg-muted/20 rounded-lg">
                <span className="text-xs text-muted-foreground">Carregando waveform...</span>
            </div>
        );
    }

    if (error || !peaks) {
        return (
            <div className="h-14 w-full flex items-center gap-0.5">
                {Array.from({ length: 80 }).map((_, i) => (
                    <div
                        key={i}
                        className="w-1 rounded-full bg-muted-foreground/20 flex-shrink-0"
                        style={{ height: `${25 + Math.sin(i * 0.3) * 15}px` }}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            role="slider"
            aria-valuemin={0}
            aria-valuemax={duration}
            aria-valuenow={currentTime}
            tabIndex={0}
            onClick={handleClick}
            onKeyDown={(e) => {
                if (e.key === 'ArrowLeft' && onSeek) onSeek(Math.max(0, currentTime - 5));
                if (e.key === 'ArrowRight' && onSeek) onSeek(Math.min(duration, currentTime + 5));
            }}
            className="h-14 w-full cursor-pointer rounded-lg overflow-hidden"
        >
            <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
    );
}
