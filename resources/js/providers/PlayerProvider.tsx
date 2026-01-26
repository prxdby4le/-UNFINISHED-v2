import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { type AudioVersion } from '@/repositories/audioRepository';

interface PlayerState {
    currentTrack: AudioVersion | null;
    playlist: AudioVersion[];
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    playbackRate: number;
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
    setLoopMode: (mode: 'off' | 'all' | 'one') => void;
    toggleShuffle: () => void;
    loadTrack: (track: AudioVersion) => void;
    loadPlaylist: (tracks: AudioVersion[]) => void;
    setCurrentTime: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [state, setState] = useState<PlayerState>({
        currentTrack: null,
        playlist: [],
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        playbackRate: 1,
        loopMode: 'off',
        shuffle: false,
    });

    // Initialize audio element
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'auto';

            // Event listeners
            audioRef.current.addEventListener('loadedmetadata', () => {
                setState((prev) => ({
                    ...prev,
                    duration: audioRef.current?.duration || 0,
                }));
            });

            audioRef.current.addEventListener('timeupdate', () => {
                setState((prev) => ({
                    ...prev,
                    currentTime: audioRef.current?.currentTime || 0,
                }));
            });

            const handleEnded = () => {
                setState((prev) => {
                    if (prev.loopMode === 'one') {
                        if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play();
                        }
                        return prev;
                    } else if (prev.loopMode === 'all' && prev.playlist.length > 0) {
                        // Trigger next track
                        setTimeout(() => {
                            const currentIndex = prev.playlist.findIndex(
                                (track) => track.id === prev.currentTrack?.id
                            );
                            if (currentIndex !== -1) {
                                const nextIndex = (currentIndex + 1) % prev.playlist.length;
                                const nextTrack = prev.playlist[nextIndex];
                                if (nextTrack) {
                                    loadTrack(nextTrack);
                                    setTimeout(() => play(), 100);
                                }
                            }
                        }, 100);
                        return { ...prev, isPlaying: false };
                    } else {
                        return { ...prev, isPlaying: false };
                    }
                });
            };

            audioRef.current.addEventListener('ended', handleEnded);

            audioRef.current.addEventListener('error', () => {
                setState((prev) => ({ ...prev, isPlaying: false }));
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Update audio properties when state changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = state.volume;
            audioRef.current.playbackRate = state.playbackRate;
        }
    }, [state.volume, state.playbackRate]);

    const play = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.play();
            setState((prev) => ({ ...prev, isPlaying: true }));
        }
    }, []);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setState((prev) => ({ ...prev, isPlaying: false }));
        }
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
        }
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setState((prev) => ({ ...prev, currentTime: time }));
        }
    }, []);

    const setVolume = useCallback((volume: number) => {
        const clampedVolume = Math.max(0, Math.min(1, volume));
        setState((prev) => ({ ...prev, volume: clampedVolume }));
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        const clampedRate = Math.max(0.5, Math.min(2, rate));
        setState((prev) => ({ ...prev, playbackRate: clampedRate }));
    }, []);

    const setLoopMode = useCallback((mode: 'off' | 'all' | 'one') => {
        setState((prev) => ({ ...prev, loopMode: mode }));
        if (audioRef.current) {
            audioRef.current.loop = mode === 'one';
        }
    }, []);

    const toggleShuffle = useCallback(() => {
        setState((prev) => ({ ...prev, shuffle: !prev.shuffle }));
    }, []);

    const loadTrack = useCallback((track: AudioVersion) => {
        if (audioRef.current) {
            const url = `/storage/${track.file_path}`;
            audioRef.current.src = url;
            setState((prev) => ({
                ...prev,
                currentTrack: track,
                currentTime: 0,
                duration: 0,
            }));
        }
    }, []);

    const loadPlaylist = useCallback((tracks: AudioVersion[]) => {
        setState((prev) => ({
            ...prev,
            playlist: tracks,
        }));
        if (tracks.length > 0 && !state.currentTrack) {
            loadTrack(tracks[0]);
        }
    }, [state.currentTrack, loadTrack]);

    const getNextTrack = useCallback(() => {
        if (state.playlist.length === 0) return null;

        if (state.shuffle) {
            const availableTracks = state.playlist.filter(
                (track) => track.id !== state.currentTrack?.id
            );
            if (availableTracks.length === 0) return state.playlist[0];
            return availableTracks[Math.floor(Math.random() * availableTracks.length)];
        }

        const currentIndex = state.playlist.findIndex(
            (track) => track.id === state.currentTrack?.id
        );
        if (currentIndex === -1) return state.playlist[0];
        const nextIndex = (currentIndex + 1) % state.playlist.length;
        return state.playlist[nextIndex];
    }, [state.playlist, state.currentTrack, state.shuffle]);

    const getPreviousTrack = useCallback(() => {
        if (state.playlist.length === 0) return null;

        const currentIndex = state.playlist.findIndex(
            (track) => track.id === state.currentTrack?.id
        );
        if (currentIndex === -1) return state.playlist[0];
        const prevIndex = currentIndex === 0 ? state.playlist.length - 1 : currentIndex - 1;
        return state.playlist[prevIndex];
    }, [state.playlist, state.currentTrack]);

    const next = useCallback(() => {
        const nextTrack = getNextTrack();
        if (nextTrack) {
            loadTrack(nextTrack);
            // Small delay to ensure track is loaded
            setTimeout(() => {
                play();
            }, 100);
        }
    }, [getNextTrack, loadTrack, play]);

    const previous = useCallback(() => {
        const prevTrack = getPreviousTrack();
        if (prevTrack) {
            loadTrack(prevTrack);
            play();
        }
    }, [getPreviousTrack, loadTrack, play]);

    const setCurrentTime = useCallback((time: number) => {
        setState((prev) => ({ ...prev, currentTime: time }));
    }, []);

    const value: PlayerContextType = {
        ...state,
        play,
        pause,
        stop,
        next,
        previous,
        seek,
        setVolume,
        setPlaybackRate,
        setLoopMode,
        toggleShuffle,
        loadTrack,
        loadPlaylist,
        setCurrentTime,
    };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
}
