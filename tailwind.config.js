/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./views/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Libre Baskerville', 'serif'],
        script: ['cursive'], // Fallback for signatures
      },
      colors: {
        // Semantic aliases for existing colors
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // blue-500
          600: '#2563eb', // blue-600 (Main Brand)
          700: '#1d4ed8', // blue-700
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1', // indigo-500
          600: '#4f46e5', // indigo-600
          700: '#4338ca',
        }
      },
      animation: {
        'in': 'fadeIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-from-right': 'slideInFromRight 0.3s ease-out',
        'zoom-in-95': 'zoomIn95 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        zoomIn95: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        }
      }
    },
  },
  plugins: [],
}