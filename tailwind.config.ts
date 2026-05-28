import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          0: 'var(--ink-0)',
          1: 'var(--ink-1)',
          2: 'var(--ink-2)',
          3: 'var(--ink-3)',
          4: 'var(--ink-4)',
        },
        bone: {
          0: 'var(--bone-0)',
          1: 'var(--bone-1)',
          2: 'var(--bone-2)',
          3: 'var(--bone-3)',
        },
        lime: {
          DEFAULT: 'var(--lime)',
          soft: 'var(--lime-soft)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          soft: 'var(--amber-soft)',
        },
        crimson: {
          DEFAULT: 'var(--crimson)',
          soft: 'var(--crimson-soft)',
        },
        sky: { DEFAULT: 'var(--sky)' },
        cat: {
          personal: 'var(--cat-personal)',
          trabajo: 'var(--cat-trabajo)',
          salud: 'var(--cat-salud)',
          educacion: 'var(--cat-educacion)',
          otro: 'var(--cat-otro)',
        },
        prio: {
          normal: 'var(--prio-normal)',
          alta: 'var(--prio-alta)',
          urgente: 'var(--prio-urgente)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        DEFAULT: 'var(--radius)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        lift: 'var(--shadow-lg)',
      },
      letterSpacing: {
        editorial: '-0.02em',
        ticker: '0.18em',
      },
    },
  },
  plugins: [],
};

export default config;
