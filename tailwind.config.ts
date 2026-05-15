import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/ui/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7C3AED',
        accent: '#EC4899',
      },
    },
  },
  plugins: [],
};

export default config;
