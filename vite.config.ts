import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: undefined,
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        // Temporarily disabled during Docker dev to avoid PHP dependency in node container
        // Files should be pre-generated using: docker compose exec app php artisan wayfinder:generate --with-form
        // wayfinder({
        //     formVariants: true,
        // }),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    build: {
        emptyOutDir: false,
        chunkSizeWarningLimit: 600,
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});
