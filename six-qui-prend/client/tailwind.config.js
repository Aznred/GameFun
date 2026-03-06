/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#1a5c35',
          light: '#237a47',
          dark: '#0d3320',
          darker: '#081d12',
        },
        card: {
          bg: '#fffdf5',
          border: '#e8c96a',
          shine: '#fff9e0',
        },
        bull: {
          one: '#6b7280',
          two: '#d97706',
          three: '#ea580c',
          five: '#dc2626',
          seven: '#7c3aed',
        },
        cartoon: {
          yellow: '#fbbf24',
          orange: '#f97316',
          red: '#ef4444',
          pink: '#ec4899',
          purple: '#8b5cf6',
          blue: '#3b82f6',
          green: '#22c55e',
          teal: '#14b8a6',
        },
      },
      fontFamily: {
        fredoka: ['"Fredoka One"', 'cursive'],
        nunito: ['Nunito', 'sans-serif'],
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 0 0 rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 0 0 rgba(0,0,0,0.2), 0 16px 32px rgba(0,0,0,0.4)',
        'card-selected': '0 2px 0 0 rgba(0,0,0,0.2), 0 12px 40px rgba(251,191,36,0.5)',
        'btn': '0 4px 0 0 rgba(0,0,0,0.3)',
        'btn-press': '0 1px 0 0 rgba(0,0,0,0.3)',
        'glow-amber': '0 0 20px 6px rgba(251,191,36,0.5)',
        'glow-red': '0 0 20px 6px rgba(239,68,68,0.5)',
        'glow-green': '0 0 20px 6px rgba(34,197,94,0.4)',
        'panel': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-sm': 'bounceSm 0.6s cubic-bezier(0.34,1.56,0.64,1)',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-glow': 'pulseGlow 1.8s ease-in-out infinite',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        'confetti-fall': 'confettiFall linear infinite',
        'wiggle': 'wiggle 0.4s ease-in-out',
        'stamp': 'stamp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        'text-rainbow': 'textRainbow 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-12px) rotate(2deg)' },
          '66%': { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        bounceSm: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
        popIn: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '70%': { transform: 'scale(1.1) rotate(3deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '20%': { transform: 'translateX(-6px) rotate(-3deg)' },
          '40%': { transform: 'translateX(6px) rotate(3deg)' },
          '60%': { transform: 'translateX(-4px) rotate(-2deg)' },
          '80%': { transform: 'translateX(4px) rotate(2deg)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px 2px rgba(251,191,36,0.4)' },
          '50%': { boxShadow: '0 0 30px 10px rgba(251,191,36,0.8)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        confettiFall: {
          '0%': { transform: 'translateY(-10px) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(100vh) rotate(720deg)', opacity: '0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-8deg)' },
          '75%': { transform: 'rotate(8deg)' },
        },
        stamp: {
          '0%': { transform: 'scale(2)', opacity: '0' },
          '60%': { transform: 'scale(0.9)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        textRainbow: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
};
