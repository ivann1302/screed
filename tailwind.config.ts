import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Archivo'", 'system-ui', 'sans-serif'],
        display: ["'Archivo Black'", "'Archivo'", 'system-ui', 'sans-serif'],
      },
    },
  },
} satisfies Config;
