/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6df',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#16a37f',
          600: '#0d7a5f',
          700: '#0a5c48',
          800: '#0a4538',
          900: '#0c1714',
        }
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
