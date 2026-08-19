/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./player-view.html",
    "./master-map.html",
    "./ui/**/*.js",
    "./ui/**/*.jsx",
    "./engine/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          900: '#06070a', // Ultra Deep Obsidian Slate
          800: '#0f111a',
          700: '#14161c'
        },
        tomeGold: {
          DEFAULT: '#d4af37',
          bright: '#f3e5ab',
          dark: '#8c6d23',
          muted: '#c5a059'
        },
        dndRed: {
          DEFAULT: '#991b1b',
          bright: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        cinzel: ['Cinzel', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
