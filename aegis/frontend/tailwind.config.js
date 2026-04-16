/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        aegis: {
          base: '#0d1117',
          panel: '#161b22',
          surface: 'rgba(68,147,248,0.05)',
          border: '#21262d',
          active: 'rgba(68,147,248,0.5)',
          cyan: '#4493f8',
        },
        severity: {
          critical: '#f85149',
          high: '#e3b341',
          medium: '#d29922',
          low: '#56d364',
          minimal: '#3fb950',
        },
      },
      animation: {
        'border-pulse': 'border-pulse 2s ease-in-out infinite',
        'signal-ring': 'signal-ring 1.8s ease-out infinite',
        'marker-ring': 'marker-ring 1.5s ease-out infinite',
        'threat-flash': 'threat-flash 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'border-pulse': {
          '0%, 100%': { borderColor: 'rgba(248,81,73,0.4)', boxShadow: '0 0 0 rgba(248,81,73,0)' },
          '50%': { borderColor: 'rgba(248,81,73,0.9)', boxShadow: '0 0 8px rgba(248,81,73,0.35)' },
        },
        'signal-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        'marker-ring': {
          '0%': { r: '8', opacity: '0.8' },
          '100%': { r: '18', opacity: '0' },
        },
        'threat-flash': {
          '0%': { opacity: '0.3' },
          '50%': { opacity: '1' },
          '100%': { opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
