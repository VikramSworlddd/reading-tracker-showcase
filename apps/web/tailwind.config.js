/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Instrument Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          50: '#f7f7f5',
          100: '#edecea',
          200: '#dbd8d3',
          300: '#c4bfb8',
          400: '#a8a198',
          500: '#928a7d',
          600: '#857b6e',
          700: '#6f675c',
          800: '#5c554d',
          900: '#4c4742',
          950: '#282522',
        },
        paper: {
          50: '#fdfcfb',
          100: '#f9f7f4',
          200: '#f3efe9',
        },
        accent: {
          DEFAULT: '#c9553d',
          light: '#e07a65',
          dark: '#9e4130',
        },
      },
    },
  },
  plugins: [],
}

