import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-app)',
        foreground: 'var(--text-primary)',
        brand: {
          DEFAULT: 'var(--brand)',
          strong: 'var(--brand-strong)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          strong: 'var(--accent-strong)',
        },
        danger: {
          DEFAULT: 'var(--status-error)',
          strong: 'var(--status-error-strong)',
        },
        success: 'var(--status-success)',
        warning: 'var(--status-warning)',
        ink: 'var(--ink)',
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        border: {
          default: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        glow: 'var(--shadow-glow)',
        intense: 'var(--shadow-intense)',
      },
      transitionDuration: {
        fast: '120ms',
        normal: '240ms',
        slow: '420ms',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 420ms cubic-bezier(0.2, 0.65, 0.2, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
