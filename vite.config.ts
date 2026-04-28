import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { siteConfig } from './src/config/site';

const htmlConstants = {
  '%SITE_TITLE%': siteConfig.seo.title,
  '%SITE_DESCRIPTION%': siteConfig.seo.description,
  '%SITE_OG_IMAGE%': siteConfig.seo.ogImage,
  '%SITE_FAVICON%': siteConfig.assets.favicon,
};

export default defineConfig({
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
