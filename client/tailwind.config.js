/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          950: '#0a0e17',
          900: '#0f1419',
          850: '#131920',
          800: '#1a222d',
          700: '#243040',
        },
        accent: {
          DEFAULT: '#3b82f6',
          dim: '#1d4ed8',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
