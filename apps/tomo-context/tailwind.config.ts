import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#12181f', soft: '#3d4b5c', mute: '#6b7c8f' },
        paper: { DEFAULT: '#fbfaf7', card: '#ffffff', rule: '#e6e2d9' },
        slate2: '#1f2937',
        strong: { DEFAULT: '#1f7a5a', soft: '#e3f2ec' },
        shaky: { DEFAULT: '#b4740e', soft: '#fdf1dc' },
        gap: { DEFAULT: '#a8352c', soft: '#fbe8e6' },
        untouched: { DEFAULT: '#94a3b8', soft: '#f1f5f9' },
        accent: { DEFAULT: '#2b5f8f', soft: '#e7eff7' },
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Inter', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
        serif: ['ui-serif', 'Iowan Old Style', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
