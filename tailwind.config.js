/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7ff',
          300: '#a4bbff',
          400: '#7c95ff',
          500: '#5a6eff',
          600: '#4a4af5',
          700: '#3d3bd9',
          800: '#3332ae',
          900: '#2e3089',
          950: '#1e1e50',
        },
        secondary: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        kafaat: {
          gold: '#D4AF37',
          navy: '#1B365D',
          maroon: '#722F37',
          teal: '#008080',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'sans-serif'],
        english: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
