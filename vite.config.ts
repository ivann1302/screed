import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { siteConfig } from './src/config/site';

const htmlConstants = {
  '%SITE_TITLE%': siteConfig.seo.title,
  '%SITE_DESCRIPTION%': siteConfig.seo.description,
  '%SITE_OG_IMAGE%': withBase(siteConfig.seo.ogImage),
  '%SITE_FAVICON%': withBase(siteConfig.assets.favicon),
};

function normalizeBase(base: string | undefined): string {
  if (!base || base === '/') return '/';
  return `/${base.replace(/^\/|\/$/g, '')}/`;
}

function withBase(pathname: string): string {
  if (/^(https?:)?\/\//.test(pathname)) return pathname;
  const base = normalizeBase(process.env.VITE_BASE_PATH);
  return `${base.replace(/\/$/, '')}/${pathname.replace(/^\//, '')}`;
}

export default defineConfig({
  base: normalizeBase(process.env.VITE_BASE_PATH),
  plugins: [
    react(),
    {
      name: 'site-html-constants',
      transformIndexHtml(html) {
        return Object.entries(htmlConstants).reduce(
          (acc, [token, value]) => acc.replaceAll(token, value),
          html,
        );
      },
    },
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  ssgOptions: {
    script: 'async',
    formatting: 'none',
  },
});
