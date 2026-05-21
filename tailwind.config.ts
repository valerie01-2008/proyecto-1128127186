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
        primary: '#A78BFA',
        accent: '#F472B6',
      },
    },
  },
  plugins: [],
};

export default config;
