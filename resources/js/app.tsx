import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import { initializeTheme } from './hooks/use-appearance';
import { PlayerProvider } from './providers/PlayerProvider';
import AudioPlayer from './components/player/AudioPlayer';
import { KeyboardShortcutsWrapper } from './components/KeyboardShortcutsWrapper';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toast } from './components/Toast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                <ErrorBoundary>
                    <PlayerProvider>
                        <KeyboardShortcutsWrapper>
                            <App {...props} />
                            <AudioPlayer />
                        </KeyboardShortcutsWrapper>
                    </PlayerProvider>
                </ErrorBoundary>
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
