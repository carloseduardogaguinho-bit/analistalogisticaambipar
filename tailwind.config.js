/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ambipar: {
          50: '#eefdf5',
          100: '#d6fae6',
          200: '#aff4cf',
          300: '#75e9b0',
          400: '#38d58c',
          500: '#00a859', // Ambipar iconic green
          600: '#008a46',
          700: '#026d39',
          800: '#065630',
          900: '#074729',
          950: '#012816',
        },
        navy: {
          800: '#0f172a',
          900: '#0a0f1d',
          950: '#050811',
        }
      }
    },
  },
  plugins: [],
}
