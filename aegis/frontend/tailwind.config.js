/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        aegis: {
          base: '#080c18',
          panel: 'rgba(14,20,40,0.85)',
          surface: 'rgba(255,255,255,0.04)',
          border: 'rgba(0,212,255,0.15)',
          active: 'rgba(0,212,255,0.5)',
          cyan: '#00d4ff',
        },
        severity: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#f59e0b',
          low: '#84cc16',
          minimal: '#10b981',
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
          '0%, 100%': { borderColor: 'rgba(239,68,68,0.4)', boxShadow: '0 0 0 rgba(239,68,68,0)' },
          '50%': { borderColor: 'rgba(239,68,68,0.9)', boxShadow: '0 0 8px rgba(239,68,68,0.4)' },
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
