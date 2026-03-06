/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { poppins: ['Poppins', 'sans-serif'] },
      colors: {
        arcade: {
          bg: '#0f0d1a',
          surface: 'rgba(255,255,255,0.06)',
          accent: '#a78bfa',
          success: '#4ade80',
          danger: '#f87171',
        },
      },
    },
  },
  plugins: [],
};
