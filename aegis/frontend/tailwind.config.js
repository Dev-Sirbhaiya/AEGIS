/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Public Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        aegis: {
          base: '#f4f7fb',
          panel: '#ffffff',
          surface: '#eef4ff',
          border: '#dbe4f0',
          active: 'rgba(29,78,216,0.24)',
          cyan: '#1d4ed8',
        },
        severity: {
          critical: '#dc2626',
          high: '#ea580c',
          medium: '#d97706',
          low: '#22c55e',
          minimal: '#16a34a',
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
          '0%, 100%': { borderColor: 'rgba(220,38,38,0.4)', boxShadow: '0 0 0 rgba(220,38,38,0)' },
          '50%': { borderColor: 'rgba(220,38,38,0.8)', boxShadow: '0 0 0 2px rgba(220,38,38,0.15)' },
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
