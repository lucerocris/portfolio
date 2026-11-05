// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import vercel from '@astrojs/vercel';
import { loadEnv } from 'payload/node';
import react from '@astrojs/react';
import path from 'path'; // <--- 1. Add this import

loadEnv();

// https://astro.build/config
export default defineConfig({
    // The floating dev toolbar sits over the footer on small screens.
    devToolbar: { enabled: false },
    // The site is a one-pager now: About, Contact and the project index live on /.
    // The old pages and the free-audit funnel redirect there.
    redirects: {
        '/about': '/#about',
        '/projects': '/',
        '/start': '/',
        '/start/thanks': '/',
    },
    // Absolute base for canonical URLs, Open Graph tags and the sitemap.
    // Set PUBLIC_SITE_URL in production — localhost is only a dev fallback.
    site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
    output: 'server',
    adapter: vercel(),
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