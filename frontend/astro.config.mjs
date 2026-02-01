// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import node from '@astrojs/node';
import { loadEnv } from 'payload/node';
import react from '@astrojs/react';
import path from 'path'; // <--- 1. Add this import

loadEnv();

// https://astro.build/config
export default defineConfig({
    output: 'server',
    adapter: node({
        mode: 'standalone'
    }),
    integrations: [react()],
    vite: {
        plugins: [tailwindcss()],
        // 2. Add the resolve object here to link 'backend' to your folder
        resolve: {
            alias: {
                '@backend': path.resolve('../backend/src/index.ts')
            }
        }
    },
});