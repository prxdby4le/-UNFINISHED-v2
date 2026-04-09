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

/**
 * Resolves the playback URL for a track.
 */
function getTrackUrl(track: TrackWithProject): string {
    return track.url || `/storage/${track.file_path}`;
}

/**
 * Fully stops an HTMLAudioElement: pauses it, resets time,
 * clears source, and removes all inline event handlers.
 */
function killAudioElement(el: HTMLAudioElement | null) {
    if (!el) return;
    el.pause();
    el.removeAttribute('src');
    el.load(); // resets the element
    el.onloadedmetadata = null;
    el.ontimeupdate = null;
    el.onended = null;
    el.onerror = null;
    el.oncanplay = null;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    // Single audio element for playback — never swapped
    const audioRef = useRef<HTMLAudioElement | null>(null);
    // Secondary element used ONLY for preloading (browser cache warming)
    const preloadRef = useRef<HTMLAudioElement | null>(null);
    const preloadedTrackIdRef = useRef<number | null>(null);
    // Guard against play/load race conditions
    const playIntentRef = useRef(0);

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

    // ─── Track navigation helpers ────────────────────────────────────

    const getNextTrackFor = useCallback(
        (current: TrackWithProject | null, playlist: TrackWithProject[], shuffle: boolean): TrackWithProject | null => {
            if (playlist.length === 0 || !current) return null;
            if (shuffle) {
                const others = playlist.filter((t) => t.id !== current.id);
                return others.length > 0 ? others[Math.floor(Math.random() * others.length)] : playlist[0];
            }
            const idx = playlist.findIndex((t) => t.id === current.id);
            if (idx === -1) return playlist[0];
            return playlist[(idx + 1) % playlist.length];
        },
        [],
    );

    const getPrevTrack = useCallback((): TrackWithProject | null => {
        const { playlist, currentTrack } = stateRef.current;
        if (playlist.length === 0 || !currentTrack) return null;
        const idx = playlist.findIndex((t) => t.id === currentTrack.id);
        if (idx === -1) return playlist[0];
        return playlist[idx === 0 ? playlist.length - 1 : idx - 1];
    }, []);

    // ─── Audio property helpers ──────────────────────────────────────

    const applyAudioProps = useCallback((el: HTMLAudioElement) => {
        const s = stateRef.current;
        el.volume = s.volume;
        el.preservesPitch = s.pitchSemitones === 0;
        el.playbackRate = s.playbackRate * Math.pow(2, s.pitchSemitones / 12);
    }, []);

    // ─── Preload (cache-warming only, never used for playback) ───────

    const preloadNext = useCallback(() => {
        const s = stateRef.current;
        const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
        if (!upcoming || upcoming.id === preloadedTrackIdRef.current) return;

        if (!preloadRef.current) {
            preloadRef.current = new Audio();
        }
        // Kill any previous preload to avoid lingering network requests
        preloadRef.current.pause();
        preloadRef.current.src = getTrackUrl(upcoming);
        preloadRef.current.preload = 'auto';
        preloadRef.current.load();
        preloadedTrackIdRef.current = upcoming.id;
    }, [getNextTrackFor]);

    // ─── Core audio lifecycle (runs once on mount) ───────────────────

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'auto';
        }

        const audio = audioRef.current;

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

            // Loop single track
            if (s.loopMode === 'one') {
                audio.currentTime = 0;
                audio.play().catch(() => {});
                return;
            }

            // No playlist — just stop
            if (s.playlist.length === 0) {
                setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
                return;
            }

            const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
            if (!upcoming) {
                setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
                return;
            }

            // If loop is off and we're on the last track, stop
            const isLastTrack = (() => {
                if (s.shuffle) return false;
                const idx = s.playlist.findIndex((t) => t.id === s.currentTrack?.id);
                return idx === s.playlist.length - 1;
            })();

            if (isLastTrack && s.loopMode === 'off') {
                setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
                return;
            }

            // ── Transition to the next track on the SAME audio element ──
            // The browser cache will already have the data if preloadNext ran.
            audio.src = getTrackUrl(upcoming);
            applyAudioProps(audio);
            preloadedTrackIdRef.current = null;

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
        // All deps are stable (useCallback with []), so this runs once.
    }, [applyAudioProps, getNextTrackFor, preloadNext]);

    // ─── Sync volume / playback-rate / pitch to audio element ────────

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = state.volume;
            audioRef.current.preservesPitch = state.pitchSemitones === 0;
            audioRef.current.playbackRate = state.playbackRate * Math.pow(2, state.pitchSemitones / 12);
        }
    }, [state.volume, state.playbackRate, state.pitchSemitones]);

    // ─── Adaptive Theming Based on Cover Art ─────────────────────────

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
                document.documentElement.style.removeProperty('--gradient-from');
                document.documentElement.style.removeProperty('--gradient-to');
                document.documentElement.style.removeProperty('--gradient-accent');
                document.documentElement.style.removeProperty('--theme-base-color');
            });

        return () => {
            fac.destroy();
        };
    }, [state.currentTrack?.project?.cover_path]);

    // ─── Playback controls ───────────────────────────────────────────

    const play = useCallback(() => {
        const audio = audioRef.current;
        if (!audio || !audio.src) return;

        const intent = ++playIntentRef.current;
        audio.play()
            .then(() => {
                // Only update state if this is still the latest play intent
                if (playIntentRef.current === intent) {
                    setState((prev) => ({ ...prev, isPlaying: true }));
                }
            })
            .catch(() => {
                // Ignore AbortError from rapid play/pause, but mark stopped for real errors
                if (playIntentRef.current === intent) {
                    setState((prev) => ({ ...prev, isPlaying: false }));
                }
            });
    }, []);

    const pause = useCallback(() => {
        ++playIntentRef.current; // Invalidate any pending play() promise
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
        }
        // Also kill the preload element in case it somehow got into a playing state
        if (preloadRef.current && !preloadRef.current.paused) {
            preloadRef.current.pause();
        }
        setState((prev) => ({ ...prev, isPlaying: false }));
    }, []);

    const stop = useCallback(() => {
        ++playIntentRef.current;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
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
        if (audioRef.current) audioRef.current.loop = mode === 'one';
    }, []);

    const toggleShuffle = useCallback(() => {
        setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
    }, []);

    // ─── Track loading ───────────────────────────────────────────────

    const loadTrack = useCallback(
        (track: TrackWithProject & { project_info?: ProjectInfo }) => {
            const audio = audioRef.current;
            if (!audio) return;

            const normalized: TrackWithProject = {
                ...track,
                project: track.project ?? track.project_info,
            };

            // Stop whatever is currently playing before switching source
            ++playIntentRef.current;
            audio.pause();

            audio.src = getTrackUrl(normalized);
            applyAudioProps(audio);
            preloadedTrackIdRef.current = null;

            setState((prev) => ({
                ...prev,
                currentTrack: normalized,
                currentTime: 0,
                duration: 0,
            }));
        },
        [applyAudioProps],
    );

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

    // ─── Next / Previous (with safe autoplay) ────────────────────────

    const next = useCallback(() => {
        const s = stateRef.current;
        const upcoming = getNextTrackFor(s.currentTrack, s.playlist, s.shuffle);
        if (!upcoming) return;

        const audio = audioRef.current;
        if (!audio) return;

        // Stop current playback, load new track, and auto-play
        ++playIntentRef.current;
        audio.pause();
        audio.src = getTrackUrl(upcoming);
        applyAudioProps(audio);
        preloadedTrackIdRef.current = null;

        const intent = ++playIntentRef.current;
        setState((prev) => ({
            ...prev,
            currentTrack: upcoming,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
        }));

        audio.play().catch(() => {
            if (playIntentRef.current === intent) {
                setState((prev) => ({ ...prev, isPlaying: false }));
            }
        });
    }, [getNextTrackFor, applyAudioProps]);

    const previous = useCallback(() => {
        const prev = getPrevTrack();
        if (!prev) return;

        const audio = audioRef.current;
        if (!audio) return;

        ++playIntentRef.current;
        audio.pause();
        audio.src = getTrackUrl(prev);
        applyAudioProps(audio);
        preloadedTrackIdRef.current = null;

        const intent = ++playIntentRef.current;
        setState((s) => ({
            ...s,
            currentTrack: prev,
            currentTime: 0,
            duration: 0,
            isPlaying: true,
        }));

        audio.play().catch(() => {
            if (playIntentRef.current === intent) {
                setState((s) => ({ ...s, isPlaying: false }));
            }
        });
    }, [getPrevTrack, applyAudioProps]);

    const setCurrentTime = useCallback((time: number) => {
        setState((prev) => ({ ...prev, currentTime: time }));
    }, []);

    // ─── Cleanup on unmount ──────────────────────────────────────────

    useEffect(() => {
        return () => {
            killAudioElement(audioRef.current);
            killAudioElement(preloadRef.current);
        };
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
