import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { type AudioVersion } from '@/repositories/audioRepository';
import { FastAverageColor } from 'fast-average-color';

interface ProjectInfo {
    id: number;
    name: string;
    cover_path?: string;
    cover_url?: string;
}

type TrackWithProject = AudioVersion & { project?: ProjectInfo };

// ... (skip unchanged lines, but I need to do this via multi_replace_file_content or narrow chunks)

interface PlayerState {
    currentTrack: TrackWithProject | null;
    playlist: TrackWithProject[];
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
    pitchSemitones: number;
    loopMode: 'off' | 'all' | 'one';
    shuffle: boolean;
}

interface PlayerContextType extends PlayerState {
    play: () => void;
    pause: () => void;
    stop: () => void;
    next: () => void;
    previous: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setPlaybackRate: (rate: number) => void;
    setPitch: (semitones: number) => void;
    setLoopMode: (mode: 'off' | 'all' | 'one') => void;
    toggleShuffle: () => void;
    loadTrack: (track: TrackWithProject) => void;
    loadPlaylist: (tracks: TrackWithProject[], project?: ProjectInfo) => void;
    setCurrentTime: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

const PRELOAD_THRESHOLD_S = 5;

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const activeRef = useRef<HTMLAudioElement | null>(null);
    const nextRef = useRef<HTMLAudioElement | null>(null);
    const preloadedTrackIdRef = useRef<number | null>(null);

    const [state, setState] = useState<PlayerState>({
        currentTrack: null,
        playlist: [],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        pitchSemitones: 0,
        loopMode: 'off',
        shuffle: false,
    });

    const stateRef = useRef(state);
    stateRef.current = state;

    const getNextTrackFor = useCallback((current: TrackWithProject | null, playlist: TrackWithProject[], shuffle: boolean): TrackWithProject | null => {
        if (playlist.length === 0 || !current) return null;
        if (shuffle) {
            const others = playlist.filter((t) => t.id !== current.id);
            return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : playlist[0];
        }
        const idx = playlist.findIndex((t) => t.id === current.id);
        if (idx === -1) return playlist[0];
        return playlist[(idx + 1) % playlist.length];
    }, []);

    const getPrevTrack = useCallback((): TrackWithProject | null => {
        const { playlist, currentTrack } = stateRef.current;
        if (playlist.length === 0 || !currentTrack) return null;
        const idx = playlist.findIndex((t) => t.id === currentTrack.id);
        if (idx === -1) return playlist[0];
        return playlist[idx === 0 ? playlist.length - 1 : idx - 1];
    }, []);

    const applyAudioProps = useCallback((el: HTMLAudioElement) => {
        const s = stateRef.current;
        el.volume = s.volume;
        el.preservesPitch = s.pitchSemitones === 0;
        el.playbackRate = s.playbackRate * Math.pow(2, s.pitchSemitones / 12);
    }, []);

    const preloadNext = useCallback(() => {
        const s = stateRef.current;
        const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
        if (!upcoming || upcoming.id === preloadedTrackIdRef.current) return;
        if (!nextRef.current) {
            nextRef.current = new Audio();
        }
        nextRef.current.src = upcoming.url || `/storage/${upcoming.file_path}`;
        nextRef.current.preload = 'auto';
        nextRef.current.load();
        preloadedTrackIdRef.current = upcoming.id;
    }, [getNextTrackFor]);

    useEffect(() => {
        if (!activeRef.current) {
            activeRef.current = new Audio();
            activeRef.current.preload = 'auto';
        }

        const audio = activeRef.current;

        const onLoadedMetadata = () => {
            setState((prev) => ({ ...prev, duration: audio.duration || 0 }));
        };

        const onTimeUpdate = () => {
            const time = audio.currentTime || 0;
            setState((prev) => ({ ...prev, currentTime: time }));

            const s = stateRef.current;
            if (audio.duration && audio.duration - time < PRELOAD_THRESHOLD_S && s.loopMode !== 'one') {
                preloadNext();
            }
        };

        const onEnded = () => {
            const s = stateRef.current;

            if (s.loopMode === 'one') {
                audio.currentTime = 0;
                audio.play();
                return;
            }

            if (s.playlist.length === 0) {
                setState((prev) => ({ ...prev, isPlaying: false }));
                return;
            }

            const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
            if (!upcoming) {
                setState((prev) => ({ ...prev, isPlaying: false }));
                return;
            }

            const isLastTrack = (() => {
                if (s.shuffle) return false;
                const idx = s.playlist.findIndex((t) => t.id === s.currentTrack?.id);
                return idx === s.playlist.length - 1;
            })();

            if (isLastTrack && s.loopMode === 'off') {
                setState((prev) => ({ ...prev, isPlaying: false }));
                return;
            }

            if (nextRef.current && preloadedTrackIdRef.current === upcoming.id) {
                const old = activeRef.current;
                activeRef.current = nextRef.current;
                nextRef.current = old;
                preloadedTrackIdRef.current = null;

                const newActive = activeRef.current;
                applyAudioProps(newActive);

                newActive.onloadedmetadata = () => {
                    setState((prev) => ({ ...prev, duration: newActive.duration || 0 }));
                };
                newActive.ontimeupdate = () => {
                    const t = newActive.currentTime || 0;
                    setState((prev) => ({ ...prev, currentTime: t }));
                    if (newActive.duration && newActive.duration - t < PRELOAD_THRESHOLD_S && stateRef.current.loopMode !== 'one') {
                        preloadNext();
                    }
                };
                newActive.onended = onEnded;
                newActive.onerror = () => setState((prev) => ({ ...prev, isPlaying: false }));

                setState((prev) => ({
                    ...prev,
                    currentTrack: upcoming,
                    currentTime: 0,
                    duration: newActive.duration || 0,
                    isPlaying: true,
                }));

                newActive.play().catch(() => {
                    setState((prev) => ({ ...prev, isPlaying: false }));
                });
            } else {
                audio.src = upcoming.url || `/storage/${upcoming.file_path}`;
                applyAudioProps(audio);
                setState((prev) => ({
                    ...prev,
                    currentTrack: upcoming,
                    currentTime: 0,
                    duration: 0,
                    isPlaying: true,
                }));
                audio.play().catch(() => {
                    setState((prev) => ({ ...prev, isPlaying: false }));
                });
            }
        };

        const onError = () => {
            setState((prev) => ({ ...prev, isPlaying: false }));
        };

        audio.addEventListener('loadedmetadata', onLoadedMetadata);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('loadedmetadata', onLoadedMetadata);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
            audio.pause();
        };
    }, [applyAudioProps, getNextTrackFor, preloadNext]);

    useEffect(() => {
        if (activeRef.current) {
            activeRef.current.volume = state.volume;
            activeRef.current.preservesPitch = state.pitchSemitones === 0;
            activeRef.current.playbackRate = state.playbackRate * Math.pow(2, state.pitchSemitones / 12);
        }
    }, [state.volume, state.playbackRate, state.pitchSemitones]);

    // Adaptive Theming Based on Cover Art
    useEffect(() => {
        const coverPath = state.currentTrack?.project?.cover_path;

        if (!coverPath) {
            document.documentElement.style.removeProperty('--gradient-from');
            document.documentElement.style.removeProperty('--gradient-to');
            document.documentElement.style.removeProperty('--gradient-accent');
            document.documentElement.style.removeProperty('--theme-base-color');
            return;
        }

        const fac = new FastAverageColor();
        const imageUrl = state.currentTrack?.project?.cover_url || `/storage/${coverPath}`;

        fac.getColorAsync(imageUrl, { crossOrigin: 'anonymous' })
            .then((color) => {
                const [r, g, b] = color.value;
                const darken = (v: number) => Math.max(0, v - 50);
                const lighten = (v: number) => Math.min(255, v + 50);

                const hexTo = `rgb(${darken(r)}, ${darken(g)}, ${darken(b)})`;
                const hexAccent = `rgb(${lighten(r)}, ${lighten(g)}, ${lighten(b)})`;

                document.documentElement.style.setProperty('--gradient-from', color.hex);
                document.documentElement.style.setProperty('--gradient-to', hexTo);
                document.documentElement.style.setProperty('--gradient-accent', hexAccent);
                document.documentElement.style.setProperty('--theme-base-color', `rgb(${r}, ${g}, ${b})`);
            })
            .catch(() => {
                // Failsafe in case image is missing or CORS error
                document.documentElement.style.removeProperty('--gradient-from');
                document.documentElement.style.removeProperty('--gradient-to');
                document.documentElement.style.removeProperty('--gradient-accent');
                document.documentElement.style.removeProperty('--theme-base-color');
            });

        return () => {
            fac.destroy();
        };
    }, [state.currentTrack?.project?.cover_path]);

    const play = useCallback(() => {
        if (activeRef.current) {
            activeRef.current.play().then(() => {
                setState((prev) => ({ ...prev, isPlaying: true }));
            }).catch(() => {});
        }
    }, []);

    const pause = useCallback(() => {
        if (activeRef.current) {
            activeRef.current.pause();
            setState((prev) => ({ ...prev, isPlaying: false }));
        }
    }, []);

    const stop = useCallback(() => {
        if (activeRef.current) {
            activeRef.current.pause();
            activeRef.current.currentTime = 0;
            setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (activeRef.current) {
            activeRef.current.currentTime = time;
            setState((prev) => ({ ...prev, currentTime: time }));
        }
    }, []);

    const setVolume = useCallback((v: number) => {
        setState((prev) => ({ ...prev, volume: Math.max(0, Math.min(1, v)) }));
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        setState((prev) => ({ ...prev, playbackRate: Math.max(0.5, Math.min(2, rate)) }));
    }, []);

    const setPitch = useCallback((semitones: number) => {
        setState((prev) => ({ ...prev, pitchSemitones: Math.max(-12, Math.min(12, semitones)) }));
    }, []);

    const setLoopMode = useCallback((mode: 'off' | 'all' | 'one') => {
        setState((prev) => ({ ...prev, loopMode: mode }));
        if (activeRef.current) activeRef.current.loop = mode === 'one';
    }, []);

    const toggleShuffle = useCallback(() => {
        setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
    }, []);

    const loadTrack = useCallback((track: TrackWithProject & { project_info?: ProjectInfo }) => {
        if (activeRef.current) {
            const normalized: TrackWithProject = {
                ...track,
                project: track.project ?? track.project_info,
            };
            activeRef.current.src = normalized.url || `/storage/${normalized.file_path}`;
            applyAudioProps(activeRef.current);
            preloadedTrackIdRef.current = null;
            setState((prev) => ({
                ...prev,
                currentTrack: normalized,
                currentTime: 0,
                duration: 0,
            }));
        }
    }, [applyAudioProps]);

    const loadPlaylist = useCallback(
        (tracks: (TrackWithProject & { project_info?: ProjectInfo })[], project?: ProjectInfo) => {
            const withProject = tracks.map((t) => ({
                ...t,
                project: t.project ?? t.project_info ?? project,
            }));
            setState((prev) => ({ ...prev, playlist: withProject }));
            if (withProject.length > 0 && !stateRef.current.currentTrack) {
                loadTrack(withProject[0]);
            }
        },
        [loadTrack],
    );

    const next = useCallback(() => {
        const s = stateRef.current;
        const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
        if (upcoming) {
            loadTrack(upcoming);
            setTimeout(() => play(), 50);
        }
    }, [getNextTrackFor, loadTrack, play]);

    const previous = useCallback(() => {
        const prev = getPrevTrack();
        if (prev) {
            loadTrack(prev);
            setTimeout(() => play(), 50);
        }
    }, [getPrevTrack, loadTrack, play]);

    const setCurrentTime = useCallback((time: number) => {
        setState((prev) => ({ ...prev, currentTime: time }));
    }, []);

    return (
        <PlayerContext.Provider
            value={{
                ...state,
                play,
                pause,
                stop,
                next,
                previous,
                seek,
                setVolume,
                setPlaybackRate,
                setPitch,
                setLoopMode,
                toggleShuffle,
                loadTrack,
                loadPlaylist,
                setCurrentTime,
            }}
        >
            {children}
        </PlayerContext.Provider>
    );
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
