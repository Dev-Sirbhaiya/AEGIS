/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aegis: {
          dark: '#0a0a0f',
          panel: '#111118',
          border: '#1e1e2e',
          accent: '#3b82f6',
        },
        severity: {
          critical: '#DC2626',
          high: '#EA580C',
          medium: '#CA8A04',
          low: '#2563EB',
          info: '#16A34A',
        },
      },
    },
  },
  plugins: [],
};
