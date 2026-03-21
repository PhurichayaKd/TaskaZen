/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Sarabun', 'sans-serif'],
      },
      colors: {
        'zen-white': '#FFFFFF',
        'zen-bg': '#F8FAFC',
        'zen-blue': '#E0F2FE', // Sky Blue Pastel
        'zen-blue-dark': '#0EA5E9', // Professional Blue
        'zen-matcha': '#ECFCCB', // Matcha Green Pastel
        'zen-matcha-dark': '#65A30D', // Professional Green
        'zen-navy': '#1E3A8A', // Deep Navy
        'zen-purple': '#F3E8FF', // Purple Pastel
        'zen-purple-dark': '#9333EA', // Professional Purple
        'zen-accent': '#3B82F6', // Action Color
        // Dark Mode equivalents
        'zen-dark-bg': '#0F172A', // Slate-900
        'zen-dark-card': '#1E293B', // Slate-800
        'zen-dark-border': '#334155', // Slate-700
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}