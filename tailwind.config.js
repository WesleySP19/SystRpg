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
        header: ['Cinzel', 'serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(197, 160, 89, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(197, 160, 89, 0.7)' },
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        slideUp: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        pulseGlow: 'pulseGlow 2s infinite',
      }
    },
  },
  plugins: [],
}
