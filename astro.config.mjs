// @ts-check
import { defineConfig } from 'astro/config';
import trustKit from './src/integrations/trust-kit.mjs';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { itToEn, enToIt } from './src/i18n/routes.ts';

const SITE_URL = 'https://calcolalordonetto.it';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [
    trustKit({ lang: 'it', siteUrl: 'https://calcolalordonetto.it', siteName: 'CalcolaLordoNetto', founded: '2026-06-27', about: '/chi-siamo/', method: '/metodologia/' }),
    react(),
    sitemap({
      filter: (page) => !page.includes('/404'),
      serialize(item) {
        const path = item.url.replace(SITE_URL, '');
        const isEn = path.startsWith('/en/');
        const alternatePath = isEn ? enToIt[path] : itToEn[path];

        if (alternatePath) {
          const itUrl = isEn ? `${SITE_URL}${alternatePath}` : item.url;
          const enUrl = isEn ? item.url : `${SITE_URL}${alternatePath}`;
          item.links = [
            { lang: 'it', url: itUrl },
            { lang: 'en', url: enUrl },
            { lang: 'x-default', url: itUrl },
          ];
        }

        return item;
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});