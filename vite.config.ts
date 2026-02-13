import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: false,
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
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    // Separate vendor chunks for better caching and smaller initial load
                    if (id.includes('node_modules')) {
                        // React core
                        if (id.includes('/react/') || id.includes('\\react\\')) {
                            return 'react-core';
                        }
                        // React DOM
                        if (id.includes('react-dom')) {
                            return 'react-dom';
                        }
                        // Radix UI components (large library, split by package)
                        if (id.includes('@radix-ui')) {
                            // Group by base package to avoid too many chunks
                            const match = id.match(/@radix-ui\/([^/]+)/);
                            if (match) {
                                const packageName = match[1];
                                // Group smaller packages together
                                if (['react-avatar', 'react-label', 'react-separator', 'react-slot'].includes(packageName)) {
                                    return 'radix-ui-small';
                                }
                                return `radix-ui-${packageName}`;
                            }
                            return 'radix-ui';
                        }
                        // Inertia.js
                        if (id.includes('@inertiajs')) {
                            return 'inertia';
                        }
                        // Tailwind and related
                        if (id.includes('tailwind') || id.includes('clsx') || id.includes('class-variance-authority')) {
                            return 'tailwind-utils';
                        }
                        // Lucide icons (can be large)
                        if (id.includes('lucide-react')) {
                            return 'icons';
                        }
                        // Other vendor libraries
                        return 'vendor';
                    }
                },
            },
        },
        chunkSizeWarningLimit: 600, // Set to 600KB to catch large chunks
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: 'localhost',
        },
    },
});
