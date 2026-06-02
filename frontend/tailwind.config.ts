import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Editorial "library" palette — warm cream + deep ink + ember accent
        cream: {
          50:  '#FDFBF6',
          100: '#FBF7F0',
          200: '#F4EBE0',
          300: '#E8D9C4',
        },
        ink: {
          50:  '#6B5E50',
          100: '#4A4038',
          500: '#2A2018',
          900: '#1A1410',
          950: '#0F0B08',
        },
        ember: {
          400: '#D97706',
          500: '#B45309',  // primary accent — burnt amber
          600: '#92400E',
        },
        moss: {
          500: '#4A5D43',  // quiet secondary
          600: '#3B4A36',
        },
      },
      fontFamily: {
        sans: ['Geist', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', '"Source Serif Pro"', 'ui-serif', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 6px 24px -10px rgb(26 20 16 / 0.15)',
        card: '0 12px 40px -16px rgb(26 20 16 / 0.20)',
      },
      keyframes: {
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatSlow: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'reveal-up': 'revealUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) both',
        'float-slow': 'floatSlow 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
export default config;
