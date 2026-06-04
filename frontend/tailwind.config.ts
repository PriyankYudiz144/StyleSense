import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8b4b1e',
          fixed: '#ffdbc8',
          container: '#ffdbca',
        },
        secondary: {
          DEFAULT: '#2c6767',
          container: '#9ef0f0',
        },
        tertiary: {
          DEFAULT: '#446435',
          container: '#c4eda7',
        },
        surface: {
          DEFAULT: '#fcf9f4',
          container: '#f0ede9',
          'container-high': '#e8e5e1',
          'container-highest': '#e2dfdb',
          variant: '#f5ece6',
        },
        'on-surface': '#1c1c19',
        'outline-variant': '#d9c2b6',
        'inverse-surface': '#31302d',
        background: '#fcf9f4',
        glass: {
          warm: 'rgba(252,249,244,0.4)',
          'warm-mid': 'rgba(252,249,244,0.6)',
          'warm-strong': 'rgba(252,249,244,0.85)',
          dark: 'rgba(28,28,25,0.6)',
          'dark-strong': 'rgba(28,28,25,0.8)',
          border: 'rgba(255,255,255,0.4)',
          'border-subtle': 'rgba(255,255,255,0.12)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        glass: '32px',
        'glass-sm': '16px',
        'glass-xl': '40px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0,0,0,0.08)',
        'glass-sm': '0 4px 16px 0 rgba(0,0,0,0.06)',
        'glass-md': '0 8px 32px 0 rgba(0,0,0,0.05)',
        'glass-lg': '0 16px 48px 0 rgba(0,0,0,0.12)',
        'glass-xl': '0 24px 64px 0 rgba(0,0,0,0.15)',
        card: '0 2px 8px 0 rgba(0,0,0,0.06)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      animation: {
        shimmer: 'shimmer 2s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
