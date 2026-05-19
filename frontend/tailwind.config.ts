import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 20px 50px -20px rgba(56, 189, 248, 0.35)',
      },
      colors: {
        ink: {
          950: '#07111f',
          900: '#0b1728',
          800: '#10213a',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;