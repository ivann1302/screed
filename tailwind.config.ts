import type { Config } from 'tailwindcss';
import { siteConfig } from './src/config/site';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent:     siteConfig.theme.accent,
        accentDark: siteConfig.theme.accentDark,
        onAccent:   siteConfig.theme.onAccent,
        bg:         siteConfig.theme.bg,
        bgDark:     siteConfig.theme.bgDark,
        surface:    siteConfig.theme.surface,
        text:       siteConfig.theme.text,
        muted:      siteConfig.theme.muted,
        border:     siteConfig.theme.border,
        shadow:     siteConfig.theme.shadow,
        danger:     siteConfig.theme.danger,
        overlay:    siteConfig.theme.overlay,
        heroGlow:   siteConfig.theme.heroGlow,
      },
      fontFamily: {
        sans:    ["'Archivo'", 'system-ui', 'sans-serif'],
        display: ["'Archivo Black'", "'Archivo'", 'system-ui', 'sans-serif'],
        mono:    ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
      // brutalist offset-shadow utilities
      boxShadow: {
        brutal:    `6px 6px 0 0 ${siteConfig.theme.shadow}`,
        brutalLg:  `8px 8px 0 0 ${siteConfig.theme.shadow}`,
        brutalSm:  `3px 3px 0 0 ${siteConfig.theme.shadow}`,
      },
      keyframes: {
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
      },
    },
    // Brutalist override: все «прямоугольные» radii обнуляем, full оставляем для точек/FAB
    borderRadius: {
      none: '0',
      sm:   '0',
      DEFAULT: '0',
      md:   '0',
      lg:   '0',
      xl:   '0',
      '2xl': '0',
      '3xl': '0',
      full: '9999px',
    },
  },
} satisfies Config;
