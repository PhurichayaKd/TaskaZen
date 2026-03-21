/** @type {import('tailwindcss').Config} */
export default {
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
        'zen-cream': '#FFFDF5', // 60% Background
        'zen-mint': '#E6F7F1',  // 30% Primary/UI
        'zen-mint-dark': '#C1EBDD',
        'zen-purple': '#F3E8FF', // 30% Alternative UI
        'zen-purple-dark': '#E9D5FF',
        'zen-peach': '#FFD8B1',  // 10% Accent/CTA
        'zen-peach-dark': '#FFC28C',
        'zen-blue': '#BAE6FD',   // 10% Alternative Accent
        'zen-blue-dark': '#7DD3FC',
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
