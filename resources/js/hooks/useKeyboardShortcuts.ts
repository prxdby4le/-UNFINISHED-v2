import { useEffect } from 'react';
import { usePlayer } from '@/providers/PlayerProvider';

export function useKeyboardShortcuts() {
    const player = usePlayer();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input/textarea
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable)
            ) {
                return;
            }

            // Space: Play/Pause
            if (e.code === 'Space' && !e.ctrlKey && !e.metaKey) {
                e.preventDefault();
                if (player.isPlaying) {
                    player.pause();
                } else {
                    player.play();
                }
            }

            // Arrow Left: Previous track
            if (e.code === 'ArrowLeft' && e.ctrlKey) {
                e.preventDefault();
                player.previous();
            }

            // Arrow Right: Next track
            if (e.code === 'ArrowRight' && e.ctrlKey) {
                e.preventDefault();
                player.next();
            }

            // Arrow Up: Volume up
            if (e.code === 'ArrowUp' && e.ctrlKey) {
                e.preventDefault();
                player.setVolume(Math.min(1, player.volume + 0.1));
            }

            // Arrow Down: Volume down
            if (e.code === 'ArrowDown' && e.ctrlKey) {
                e.preventDefault();
                player.setVolume(Math.max(0, player.volume - 0.1));
            }

            // Ctrl+K: Search (can be implemented later)
            if (e.code === 'KeyK' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                // TODO: Open search modal
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [player]);
}
