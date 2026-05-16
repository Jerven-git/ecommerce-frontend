import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'var(--color-primary-50, #eef4fd)',
          100: 'var(--color-primary-100, #d9e6fb)',
          200: 'var(--color-primary-200, #b8d0f7)',
          300: 'var(--color-primary-300, #8eb4f0)',
          400: 'var(--color-primary-400, #7ba6ee)',
          500: 'var(--color-primary-500, #70a0ed)',
          600: 'var(--color-primary, #6898ED)',
          700: 'var(--color-primary-700, #4f7dd4)',
          800: 'var(--color-primary-800, #3f64ab)',
          900: 'var(--color-primary-900, #36538a)',
          950: 'var(--color-primary-950, #253660)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #edf0f4)',
          100: 'var(--color-secondary-100, #d7dee7)',
          200: 'var(--color-secondary-200, #b4c0d1)',
          300: 'var(--color-secondary-300, #8b9bb4)',
          400: 'var(--color-secondary-400, #6c7e9a)',
          500: 'var(--color-secondary-500, #586a87)',
          600: 'var(--color-secondary, #4B5979)',
          700: 'var(--color-secondary-700, #3e4a66)',
          800: 'var(--color-secondary-800, #323c52)',
          900: 'var(--color-secondary-900, #283041)',
          950: 'var(--color-secondary-950, #1b2130)',
        },
      },
      fontFamily: {
        heading: 'var(--font-heading, "Inter", sans-serif)',
        body: 'var(--font-body, "Inter", sans-serif)',
      },
    },
  },
} satisfies Partial<Config>