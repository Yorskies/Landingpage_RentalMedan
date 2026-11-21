// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sanity from '@sanity/astro';
import { loadEnv } from 'vite';

// astro.config runs before Astro loads .env, so read PUBLIC_* via Vite's loadEnv
const { PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET, PUBLIC_SITE_URL } = loadEnv(
  process.env.NODE_ENV ?? 'development',
  process.cwd(),
  '',
);

export default defineConfig({
  site: PUBLIC_SITE_URL || undefined, // canonical URL; set to the production domain
  integrations: [
    sanity({
      // The integration throws without a projectId; src/lib/sanity.ts skips all fetches (mock data) when the env var is empty
      projectId: PUBLIC_SANITY_PROJECT_ID || 'unconfigured',
      dataset: PUBLIC_SANITY_DATASET ?? 'production',
      useCdn: false, // static build: always read fresh published content
      apiVersion: '2026-11-21',
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
