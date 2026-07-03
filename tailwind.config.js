/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Oswald"', '"Space Grotesk"', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        readme: '0 0 24px rgba(42, 60, 90, 0.55)'
      },
      animation: {
        'fade-up': 'fadeUp 600ms ease-out both'
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: []
};
