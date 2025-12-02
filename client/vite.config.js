import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
    plugins: [
        react(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
            }
        }
    },
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            },
        },
    }
});
